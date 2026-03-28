"use server"

import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const org = user.memberships[0].organization
    const allDomains: any[] = []
    
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
            
            allDomains.push({
              id: `${res.id}-${idx}`,
              name: domain,
              project: res.name,
              type: isInternal ? "internal" : (isWildcard ? "wildcard" : "custom"),
              // Inferimos estado simulado si está corriendo el servicio (normalmente con Coolify/Traefik se autogeneran si apunta el DNS)
              ssl: res.status === "running" ? "active" : "pending",
              status: res.status === "running" ? "verified" : "unverified",
            })
          })
        }
      })
    })

    return allDomains

  } catch (error) {
    console.error("Error fetching domains:", error)
    return []
  }
}

export async function addDomainToResource(resourceId: string, newDomain: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: { project: { include: { organization: { include: { members: { where: { userId: session.sub } } } } } } }
    })

    if (!resource || resource.project.organization.members.length === 0) {
      throw new Error("Recurso no encontrado o sin acceso")
    }

    const config = typeof resource.config === "string" ? JSON.parse(resource.config) : resource.config
    if (!config.coolify_uuid) {
      throw new Error("El recurso no tiene un UUID válido de Coolify")
    }

    // Preparar el string de dominios de forma segura
    let currentFqdnStr = config.custom_fqdn || ""
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "")
    // Coolify expects full URLs natively usually, but will accept custom naked domains. Better to enforce standard:
    const newFqdnUrl = `https://${cleanDomain}` 

    // Revisar duplicado
    if (currentFqdnStr.includes(cleanDomain)) {
      throw new Error("Este dominio ya está asignado al proyecto")
    }

    const updatedFqdnStr = currentFqdnStr ? `${currentFqdnStr},${newFqdnUrl}` : newFqdnUrl

    // Fetch the dynamic helper
    const { coolifyFetch } = await import("@/app/actions/coolify")
    
    // Impactamos a Coolify
    await coolifyFetch("PATCH", `/applications/${config.coolify_uuid}`, { fqdn: updatedFqdnStr })

    // Si Coolify responde ok (no lanza Excepción), sincronizamos nuestra DB local:
    const updatedConfig = { ...config, custom_fqdn: updatedFqdnStr }
    
    await prisma.resource.update({
      where: { id: resourceId },
      data: { config: updatedConfig }
    })

    return { success: true }

  } catch (error: any) {
    console.error("Add domain error:", error.message)
    return { success: false, error: error.message }
  }
}
