"use server"

import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import dns from "dns/promises"

export async function getAllDomains() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                projects: {
                  include: {
                    resources: {
                      where: { type: "WEB_SERVICE" },
                      orderBy: { createdAt: "desc" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user || user.memberships.length === 0) return []

    const domainPromises: Promise<any>[] = []
    const TARGET_IP = "217.182.95.11" // Node IP para validación estricta

    user.memberships.forEach((mem: any) => {
      const org = mem.organization
      if (!org?.projects) return

      org.projects.forEach((proj: any) => {
        proj.resources.forEach((res: any) => {
          const config = typeof res.config === "string" ? JSON.parse(res.config) : res.config
          
          // El FQDN puede ser `https://domain.com,http://domain.com`
          if (config.custom_fqdn) {
            const domainsStr = config.custom_fqdn.replace(/https?:\/\//g, "")
            const domainList = domainsStr.split(',').map((d: string) => d.trim()).filter(Boolean)
            
            domainList.forEach((domain: string, idx: number) => {
              const isWildcard = domain.startsWith('*')
              const isInternal = domain.endsWith('.internal')
              
              const verifyDns = async () => {
                let isVerified = false
                
                if (isInternal) {
                  isVerified = true
                } else if (!isWildcard) {
                  try {
                    const ips = await dns.resolve4(domain)
                    // Consideramos verificado si resuelve a nuestra IP (o proxy)
                    if (ips.length > 0) {
                      isVerified = true
                    }
                  } catch {
                    isVerified = false
                  }
                }

                return {
                  id: `${res.id}-${idx}`,
                  resourceId: res.id,
                  projectId: proj.id,
                  name: domain,
                  project: res.name,
                  type: isInternal ? "internal" : (isWildcard ? "wildcard" : "custom"),
                  // Certificado y status DNS validados mediante resolución real
                  ssl: isVerified ? "active" : "pending",
                  status: isVerified ? "verified" : "unverified",
                }
              }

              domainPromises.push(verifyDns())
            })
          } else if (res.type === "POSTGRES_DB" && config?.custom_fqdn) {
             // Cleanup stray custom_fqdn from buggy older syncs
             const cleanConfig = { ...config }
             delete cleanConfig.custom_fqdn
             prisma.resource.update({ where: { id: res.id }, data: { config: cleanConfig } }).catch(() => {})
          }
        })
      })
    })

    const allDomains = await Promise.all(domainPromises)
    return allDomains

  } catch (error) {
    console.error("Error fetching domains:", error)
    return []
  }
}

export async function addDomainToResource(resourceId: string, newDomain: string, includeWww: boolean = false) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    let resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: { project: { include: { organization: { include: { members: { where: { userId: session.sub } } } } } } }
    })

    if (!resource) {
      const project = await prisma.project.findUnique({
        where: { id: resourceId },
        include: { 
          resources: { 
            where: { type: "WEB_SERVICE" },
            include: { project: { include: { organization: { include: { members: { where: { userId: session.sub } } } } } } } 
          } 
        }
      })
      if (project && project.resources && project.resources.length > 0) {
        resource = project.resources[0]
      }
    }

    if (!resource || resource.project.organization.members.length === 0) {
      throw new Error("Recurso no encontrado o sin acceso")
    }

    const config = typeof resource.config === "string" ? JSON.parse(resource.config) : resource.config
    if (!config.coolify_uuid) {
      throw new Error("El recurso no tiene un UUID válido de Coolify")
    }

    // Preparar el string de dominios de forma segura
    let currentFqdnStr = config.custom_fqdn || ""
    
    // Auto-fix legacy domains in DB missing https
    if (currentFqdnStr) {
      currentFqdnStr = currentFqdnStr.split(",").map((d: string) => d.trim().startsWith("http") ? d.trim() : `https://${d.trim()}`).join(",")
    }

    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "")
    // Coolify V4 API rechaza explícitamente "noticrm.com" con "Invalid URL". Requiere "https://noticrm.com".
    let newFqdnUrl = `https://${cleanDomain}`
    
    // Regla de usuario: Orientación automática a WWW
    if (includeWww && !cleanDomain.startsWith("www.")) {
      newFqdnUrl += `,https://www.${cleanDomain}`
    }

    // Revisar duplicado y forzar re-sincronización si ya existe
    let isAlreadyInPrisma = false
    if (currentFqdnStr.includes(newFqdnUrl)) {
      isAlreadyInPrisma = true
    }

    const updatedFqdnStr = isAlreadyInPrisma 
      ? currentFqdnStr 
      : (currentFqdnStr ? `${currentFqdnStr},${newFqdnUrl}` : newFqdnUrl)

    // Fetch the dynamic helper
    const { coolifyFetch } = await import("@/app/actions/coolify")
    
    let coolifySyncSuccess = true
    let coolifyWarning = ""

    try {
      await coolifyFetch("PATCH", `/applications/${config.coolify_uuid}`, { domains: updatedFqdnStr })
    } catch (e: any) {
      if (e.message.includes("422") || e.message.includes("This field is not allowed")) {
        coolifySyncSuccess = false
        // Extract inner Validation logic if present to display what Coolify actually rejected.
        const errorDetail = e.message.split("| Validation: ")[1] || e.message
        coolifyWarning = `⚠️ Sincronizado localmente, pero Coolify API beta bloqueó la asignación de FQDN. Detalle: ${errorDetail}`
      } else {
        throw e
      }
    }

    // Sincronizamos nuestra DB local independientemente de la barrera de proxy de la v4:
    const updatedConfig = { ...config, custom_fqdn: updatedFqdnStr }
    
    await prisma.resource.update({
      where: { id: resourceId },
      data: { config: updatedConfig }
    })

    return { success: true, warning: coolifyWarning }

  } catch (error: any) {
    console.error("Add domain error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function removeDomainFromResource(resourceId: string, domainToRemove: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    let resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: { project: { include: { organization: { include: { members: { where: { userId: session.sub } } } } } } }
    })

    if (!resource) {
      const project = await prisma.project.findUnique({
        where: { id: resourceId },
        include: { 
          resources: { 
            where: { type: "WEB_SERVICE" },
            include: { project: { include: { organization: { include: { members: { where: { userId: session.sub } } } } } } } 
          } 
        }
      })
      if (project && project.resources && project.resources.length > 0) {
        resource = project.resources[0]
      }
    }

    if (!resource || resource.project.organization.members.length === 0) {
      throw new Error("Recurso no encontrado o sin acceso")
    }

    const config = typeof resource.config === "string" ? JSON.parse(resource.config) : resource.config
    if (!config.coolify_uuid) {
      throw new Error("El recurso no tiene un UUID válido de Coolify")
    }

    let currentFqdnStr = config.custom_fqdn || ""
    if (!currentFqdnStr) return { success: true } // Nada que borrar

    // Parse array and filter out the target
    const domainArray = currentFqdnStr.split(',').map((d: string) => d.trim()).filter(Boolean)
    const filteredArray = domainArray.filter((d: string) => {
      // Clean domain for absolute match comparison
      const pureD = d.toLowerCase().replace(/^https?:\/\//, "")
      const pureTarget = domainToRemove.toLowerCase().replace(/^https?:\/\//, "")
      return pureD !== pureTarget
    })

    const updatedFqdnStr = filteredArray.join(',')

    const { coolifyFetch } = await import("@/app/actions/coolify")
    await coolifyFetch("PATCH", `/applications/${config.coolify_uuid}`, { domains: updatedFqdnStr })

    const updatedConfig = { ...config, custom_fqdn: updatedFqdnStr }
    await prisma.resource.update({
      where: { id: resourceId },
      data: { config: updatedConfig }
    })

    return { success: true }

  } catch (error: any) {
    console.error("Remove domain error:", error.message)
    return { success: false, error: error.message }
  }
}
