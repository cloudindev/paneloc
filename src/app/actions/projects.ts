"use server"

import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Obtiene todos los proyectos/recursos de la base de datos para el usuario actual.
 */
export async function getProjectsFromDB() {
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
                      where: { type: { in: ["WEB_SERVICE", "WORKER"] } },
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

    // Aplanar todos los recursos de todos los proyectos de la organización
    // (Por ahora simplificado a la primera org)
    const org = user.memberships[0].organization
    const allResources: any[] = []
    
    org.projects.forEach((proj: any) => {
      proj.resources.forEach((res: any) => {
        allResources.push({
          id: res.id,
          name: res.name,
          status: res.status, // Estado en DB (fallback)
          createdAt: res.createdAt,
          config: typeof res.config === "string" ? JSON.parse(res.config) : res.config,
        })
      })
    })

    return allResources

  } catch (error) {
    console.error("Error fetching projects from DB:", error)
    return []
  }
}

/**
 * Obtiene el contexto global del Dashboard (Workspace activo y recursos para el Navbar/Sidebar)
 */
export async function getDashboardContext() {
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
                      where: { type: { in: ["WEB_SERVICE", "WORKER"] } },
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

    if (!user || user.memberships.length === 0) {
      return { organizationName: "Personal", resources: [] }
    }

    const org = user.memberships[0].organization
    const allResources: any[] = []
    
    org.projects.forEach((proj: any) => {
      proj.resources.forEach((res: any) => {
        allResources.push({
          id: res.id,
          name: res.name,
          status: res.status, // DB status
          createdAt: res.createdAt,
          config: typeof res.config === "string" ? JSON.parse(res.config) : res.config,
        })
      })
    })

    return {
      organizationName: org.name,
      resources: allResources
    }

  } catch (error) {
    console.error("Error fetching dashboard context:", error)
    return { organizationName: "Personal", resources: [] }
  }
}

export async function getResourceById(id: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: {
              include: {
                members: {
                  where: { userId: session.sub }
                }
              }
            }
          }
        }
      }
    })

    if (!resource || resource.project.organization.members.length === 0) {
      throw new Error("Recurso no encontrado o sin permisos")
    }

    return {
      id: resource.id,
      name: resource.name,
      status: resource.status,
      createdAt: resource.createdAt,
      projectId: resource.projectId,
      config: typeof resource.config === "string" ? JSON.parse(resource.config) : resource.config,
    }
  } catch (error) {
    console.error("Error fetching resource:", error)
    return null
  }
}

export async function getProjectDatabases(projectId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) return []

    const session = await verifyJWT(token)
    if (!session || !session.sub) return []

    const resources = await prisma.resource.findMany({
      where: { 
        projectId,
        type: "POSTGRES_DB"
      },
      orderBy: { createdAt: "desc" }
    })
    
    // Config parsing
    return resources.map((r: any) => ({
      ...r,
      config: typeof r.config === "string" ? JSON.parse(r.config) : r.config
    }))

  } catch (error) {
    console.error("Error obteniendo BDs:", error)
    return []
  }
}

import { deleteAppFromCoolify } from "./coolify"
import { revalidatePath } from "next/cache"

export async function deleteProjectAction(id: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    // Retrieve resource and verify ownership
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            organization: {
              include: {
                members: {
                  where: { userId: session.sub }
                }
              }
            }
          }
        }
      }
    })

    if (!resource || resource.project.organization.members.length === 0) {
      throw new Error("Recurso no encontrado o no tienes permisos para eliminarlo")
    }

    // Call Coolify to delete the application container and volumes
    const config = typeof resource.config === "string" ? JSON.parse(resource.config) : resource.config
    if (config?.coolify_uuid) {
      const deletionRes = await deleteAppFromCoolify(config.coolify_uuid)
      if (!deletionRes.success) {
        // En caso de que recibamos un error, solo ignoramos si el error es 404 (ya estaba borrado)
        if (!deletionRes.error?.includes("404")) {
          throw new Error(`Coolify denegó el borrado: ${deletionRes.error}`)
        }
      }
    }

    // Delete from our local database
    await prisma.resource.delete({
      where: { id }
    })

    revalidatePath("/projects")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting project:", error)
    return { success: false, error: error.message }
  }
}
