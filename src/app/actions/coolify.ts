"use server"

import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function coolifyFetch(method: string, endpoint: string, body?: any) {
  const apiUrl = process.env.COOLIFY_API_URL?.trim() || "http://127.0.0.1:8000/api/v1"
  let apiToken = process.env.COOLIFY_API_TOKEN?.trim()
  
  // Limpiar si el usuario metió la palabra Bearer dentro de la variable
  if (apiToken?.toLowerCase().startsWith("bearer ")) {
    apiToken = apiToken.substring(7).trim()
  }
  // Limpiar posibles comillas arrastradas de copiar del panel
  apiToken = apiToken?.replace(/^["']|["']$/g, "")

  if (!apiToken) throw new Error("COOLIFY_API_TOKEN no configurado en entorno.")
  
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let errorMessage = res.statusText
    try {
      const errorJson = await res.json()
      errorMessage = errorJson.message || JSON.stringify(errorJson)
    } catch {
      const text = await res.text()
      errorMessage = text || res.statusText
    }
    const tokenInfo = apiToken ? `${apiToken.substring(0, 3)}... (Len: ${apiToken.length})` : "EMPTY"
    errorMessage += ` | Debug: ${apiUrl}${endpoint} | Token: ${tokenInfo}`
    
    console.error(`Coolify API Error (${res.status} ${endpoint}):`, errorMessage)
    throw new Error(`Coolify Error: ${res.status} - ${errorMessage}`)
  }

  // Check if it's json
  const contentType = res.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return res.json()
  }
  return res.text()
}

export async function deployToCoolify(params: {
  repoFullName: string;
  branch: string;
  projectName: string;
  framework: string;
  isPrivate: boolean;
}) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    const COOLIFY_SERVER_UUID = process.env.COOLIFY_SERVER_UUID?.trim()

    if (!COOLIFY_SERVER_UUID) {
      throw new Error("COOLIFY_SERVER_UUID no configurado en el backend.")
    }

    // 1. Obtener el Project UUID por defecto en Coolify para meter la app ahí
    let targetProjectUuid = ""
    try {
      const projectsRes = await coolifyFetch("GET", "/projects")
      const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.data || [])
      
      if (projects.length > 0) {
        targetProjectUuid = projects[0].uuid
      } else {
        // En su defecto crear un proyecto "OLA-CLOUD-TENANTS"
        const newProj = await coolifyFetch("POST", "/projects", {
          name: "OLA-CLOUD-TENANTS",
          description: "Generado dinámicamente vía API"
        })
        targetProjectUuid = newProj.uuid
      }
    } catch (e: any) {
      console.warn("Fallo al obtener proyectos, intentando continuar", e)
      const cause = e.cause ? e.cause.message || e.cause.code : ""
      throw new Error(`Fallo al comunicarse con la API de Coolify: ${e.message} ${cause}`)
    }

    if (!targetProjectUuid) {
      throw new Error("No se pudo obtener ni crear un projecto en Coolify")
    }

    // 2. Crear la aplicación en Coolify
    // Coolify tiene diferentes endpoints para repos públicos vs apps privadas. De momento asumimos public para la prueba inicial MVP.
    // Si isPrivate es true, se requiere configuración de GitHub App en Coolify que mapearemos en el futuro.
    
    if (params.isPrivate) {
       console.warn("Deploying private repo: Requires Coolify GitHub App setup or Deploy Keys in advanced environments.")
       // Podríamos abortar aquí si el Coolify no soporta public github endpoint para privados (normalmente falla).
    }

    const appPayload = {
      project_uuid: targetProjectUuid,
      environment_name: "production",
      server_uuid: COOLIFY_SERVER_UUID,
      github_repository: params.repoFullName,
      github_branch: params.branch,
      build_pack: "nixpacks", // framework string (nextjs, nodejs, etc) lo usa Nixpacks internamente de todas formas.
      name: params.projectName,
    }

    const appCreated = await coolifyFetch("POST", "/applications/public", appPayload)
    const appUuid = appCreated.uuid

    if (!appUuid) {
      throw new Error("La API de Coolify no devolvió un UUID para la aplicación creada.")
    }

    // 3. Registrar el recurso en nuestra base de datos atado a este cliente
    // Primero, verificamos si el org y project existen en nuestro DB.
    // Para simplificar, buscamos la primera org del usuario.
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: { memberships: true }
    })
    
    const orgId = user?.memberships[0]?.organizationId
    if (!orgId) throw new Error("Usuario no tiene organización")

    // Buscamos o creamos un "Project" ficticio llamado "Default" o usamos el nombre del repo
    let dbProject = await prisma.project.findFirst({
      where: { organizationId: orgId, name: "Principal" }
    })

    if (!dbProject) {
      dbProject = await prisma.project.create({
        data: {
          name: "Principal",
          organizationId: orgId,
        }
      })
    }

    // Guardamos el recurso
    const resource = await prisma.resource.create({
      data: {
        name: params.projectName,
        type: "WEB_SERVICE",
        status: "starting",
        projectId: dbProject.id,
        config: {
          coolify_uuid: appUuid,
          repo: params.repoFullName,
          branch: params.branch,
          framework: params.framework,
          coolify_server: COOLIFY_SERVER_UUID
        }
      }
    })

    // 4. Iniciar el despliegue!
    // Endpoint para desplegar por id de app en coolify: POST /deploy?uuid=<app_uuid>
    try {
      await coolifyFetch("POST", `/deploy?uuid=${appUuid}&force=false`)
    } catch(deployErr) {
      console.warn("La app se creó pero el trigger de inicio falló", deployErr)
    }

    return { success: true, resourceId: resource.id, coolifyUuid: appUuid }

  } catch (error: any) {
    console.error("Error en orquestación Coolify:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}
