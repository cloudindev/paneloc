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
      config: typeof resource.config === "string" ? JSON.parse(resource.config) : resource.config,
    }
  } catch (error) {
    console.error("Error fetching resource:", error)
    return null
  }
}
