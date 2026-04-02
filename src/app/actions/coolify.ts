"use server"

import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Client } from "pg"

export async function coolifyFetch(method: string, endpoint: string, body?: any) {
  let apiUrl = process.env.COOLIFY_API_URL?.trim() || "http://127.0.0.1:8000/api/v1"
  if (apiUrl.endsWith("/")) apiUrl = apiUrl.slice(0, -1)
  if (!apiUrl.endsWith("/api/v1")) apiUrl += "/api/v1"
  
  let apiToken = process.env.COOLIFY_API_TOKEN?.trim()
  
  // Limpiar si el usuario metió la palabra Bearer dentro de la variable
  if (apiToken?.toLowerCase().startsWith("bearer ")) {
    apiToken = apiToken.substring(7).trim()
  }
  // Limpiar posibles comillas arrastradas de copiar del panel
  apiToken = apiToken?.replace(/^["']|["']$/g, "")

  if (!apiToken) throw new Error("COOLIFY_API_TOKEN no configurado en entorno.")
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  let res;
  try {
    res = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store", 
      signal: controller.signal
    })
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message.includes('abort')) {
       throw new Error(`Timeout de 12s excedido al contactar con la API de Coolify en ${endpoint}. El servidor de destino puede estar colapsado o bloqueado en una validación síncrona (ej. credenciales inválidas para git).`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    let errorMessage = res.statusText
    try {
      const errorJson = await res.json()
      // Laravel extra validation errors
      let extraErrors = ""
      if (errorJson.errors) {
        extraErrors = " | Validation: " + JSON.stringify(errorJson.errors)
      }
      errorMessage = (errorJson.message || JSON.stringify(errorJson)) + extraErrors
    } catch {
      const text = await res.text()
      errorMessage = text || res.statusText
    }
    const tokenInfo = apiToken ? `${apiToken.substring(0, 3)}... (Len: ${apiToken.length})` : "EMPTY"
    errorMessage += ` | Debug: ${apiUrl}${endpoint} | Token: ${tokenInfo}`
    if (body) {
      errorMessage += ` | RequestPayload: ${JSON.stringify(body)}`
    }
    
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
  pat?: string;
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

    // 2.A Generación de Dominio Custom Vercel-like (*.apps.olacloud.es)
    // Limpiamos el nombre para que solo tenga letras minúsculas, números y guiones
    const slugifiedName = params.projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    
    // Leemos el base domain de env var si existe, sino usamos el wildcard acordado
    const baseDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "apps.olacloud.es"
    const customFqdn = `https://${slugifiedName}.${baseDomain}`

    let gitRepositoryUrlClean = `https://github.com/${params.repoFullName}.git`

    let appPayload: any = {
      project_uuid: targetProjectUuid,
      environment_name: "production",
      server_uuid: COOLIFY_SERVER_UUID,
      git_branch: params.branch,
      build_pack: "nixpacks", // framework string (nextjs, nodejs, etc) lo usa Nixpacks internamente de todas formas.
      ports_exposes: "3000",
      name: params.projectName,
    }

    let endpoint = "/applications/public"

    if (params.isPrivate) {
      const member = await prisma.organizationMember.findFirst({
        where: { userId: session.sub },
        include: { organization: true }
      })
      const org = member?.organization

      if (!org?.githubInstallationId) {
        // Usamos un keyword "private-github-app" en el error para que el frontend destape la tarjeta naranja
        throw new Error("Faltan permisos 500 private-github-app OLA Cloud: Debes dar permisos en GitHub primero.")
      }

      // Add Deploy Key to GitHub and post it to Coolify
      const { addDeployKeyToGithubRepo } = await import("./github-deploy-key")
      let privateKey: string;
      try {
        const result = await addDeployKeyToGithubRepo(org.githubInstallationId, params.repoFullName)
        privateKey = result.privateKey;
      } catch (err: any) {
        if (err.message?.includes("Not Found") || err.message?.includes("create-an-installation-access-token")) {
           // Auto-limpieza del ID fantasma
           await prisma.organization.update({
             where: { id: org.id },
             data: { githubInstallationId: null }
           });
           throw new Error("Faltan permisos 500 private-github-app OLA Cloud: La conexión con GitHub fue revocada. Vuelve a dar permisos.")
        }
        throw err;
      }

      // Store private key in Coolify
      const keyPayload = {
        name: `ola-key-${params.projectName.substring(0,20)}-${Date.now()}`,
        description: `Auto-generated for ${params.repoFullName}`,
        private_key: privateKey
      }
      
      const keyCreated = await coolifyFetch("POST", "/security/keys", keyPayload)
      if (!keyCreated || !keyCreated.uuid) {
        throw new Error("No se pudo registrar la llave de seguridad SSH en Coolify.")
      }

      endpoint = "/applications/private-deploy-key"
      appPayload.private_key_uuid = keyCreated.uuid
      appPayload.git_repository = `git@github.com:${params.repoFullName}.git`
    } else {
      appPayload.git_repository = gitRepositoryUrlClean
    }

    const appCreated = await coolifyFetch("POST", endpoint, appPayload)
    const appUuid = appCreated.uuid

    if (!appUuid) {
      throw new Error("La API de Coolify no devolvió un UUID para la aplicación creada.")
    }

    // 2.B Inyectar el FQDN mediante un update al recurso tras su creación
    try {
      let patchPayload: any = { domains: customFqdn }
      await coolifyFetch("PATCH", `/applications/${appUuid}`, patchPayload)
    } catch (e: any) {
      console.warn("Aviso: el update del dominio falló.", e.message)
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
          coolify_server: COOLIFY_SERVER_UUID,
          domain: customFqdn // <- Lo guardamos nativo también por fallback
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

export async function getLiveProjectStatus(uuid: string) {
  try {
    const res = await coolifyFetch("GET", `/applications/${uuid}`)
    
    // FQDN returned by Coolify might be a comma-separated list of URLs (e.g. "http://domain.com,https://domain.com")
    let parsedFqdn = res.fqdn
    if (parsedFqdn && parsedFqdn.includes(",")) {
      parsedFqdn = parsedFqdn.split(",")[0].trim()
    }

    return {
      success: true,
      status: res.status, // ej. "running", "exited", etc
      fqdn: parsedFqdn,
      updated_at: res.updated_at
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteAppFromCoolify(uuid: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    // Llamada a la API de delete de Coolify v4
    // Los flags de borrado deben ir en la URL (query params), no en el body JSON.
    const query = new URLSearchParams({
      force: 'true',
      delete_configurations: 'true',
      delete_volumes: 'true',
      docker_cleanup: 'true'
    }).toString()

    await coolifyFetch("DELETE", `/applications/${uuid}?${query}`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Error eliminando aplicación en Coolify:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteDatabaseFromCoolify(resourceId: string, coolifyUuid: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    const query = new URLSearchParams({
      force: 'true',
      delete_configurations: 'true',
      delete_volumes: 'true',
      docker_cleanup: 'true'
    }).toString()

    await coolifyFetch("DELETE", `/databases/${coolifyUuid}?${query}`)

    await prisma.resource.delete({
      where: { id: resourceId }
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("Error eliminando base de datos en Coolify:", error)
    return { success: false, error: error.message }
  }
}

export async function executeDatabaseQuery(resourceId: string, query: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    // Fetch the database credentials from Prisma
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    })

    if (!resource || resource.type !== "POSTGRES_DB") {
      throw new Error("Base de datos no encontrada o tipo inválido.")
    }

    const config = typeof resource.config === "string" ? JSON.parse(resource.config) : resource.config
    const connectionUri = config.connection_uri

    if (!connectionUri) {
      throw new Error("Credenciales de conexión no disponibles.")
    }

    // Connect and execute the query safely
    const client = new Client({
      connectionString: connectionUri,
      // Defaulting to 3 seconds timeout to prevent freezing on inaccessible containers
      connectionTimeoutMillis: 3000, 
      query_timeout: 10000 
    })

    await client.connect()
    const res = await client.query(query)
    await client.end()

    return { 
      success: true, 
      rowCount: res.rowCount, 
      rows: res.rows, 
      command: res.command,
      fields: res.fields?.map(f => f.name) || []
    }
  } catch (error: any) {
    console.error("Error ejecutando SQL:", error)
    return { success: false, error: error.message }
  }
}

export async function getApplicationDeployments(uuid: string) {
  try {
    // El endpoint oficial correcto según la documentación de Coolify v4 es /deployments/applications/{uuid}
    // Retorna { count: number, deployments: ApplicationDeploymentQueue[] }
    const res = await coolifyFetch("GET", `/deployments/applications/${uuid}?take=20`).catch(() => null)
    
    if (res && res.deployments && Array.isArray(res.deployments)) {
      return { success: true, deployments: res.deployments }
    }

    if (res && Array.isArray(res)) {
      return { success: true, deployments: res }
    }

    // Fallback pasivo si todo falla para que la UI no rompa
    return { success: true, deployments: [] }
  } catch (error: any) {
    console.error("Error crítico obteniendo despliegues:", error)
    return { success: true, error: error.message, deployments: [] } 
  }
}

export async function triggerDeployment(uuid: string, force: boolean = false) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    await coolifyFetch("POST", `/deploy?uuid=${uuid}&force=${force}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error forzando redespliegue:", error)
    return { success: false, error: error.message }
  }
}

export async function getDeploymentTaskLogs(deploymentUuid: string) {
  try {
    const res = await coolifyFetch("GET", `/deployments/${deploymentUuid}`)
    return { 
      success: true, 
      logs: res.logs || "", 
      status: res.status 
    }
  } catch (error: any) {
    console.error("Error obteniendo logs de despliegue:", error)
    return { success: false, error: error.message, logs: "", status: "unknown" }
  }
}

export async function createCoolifyDatabase(projectId: string, payload: any) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No estás autenticado")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Sesión inválida")

    const COOLIFY_SERVER_UUID = process.env.COOLIFY_SERVER_UUID?.trim()
    if (!COOLIFY_SERVER_UUID) throw new Error("COOLIFY_SERVER_UUID no configurado en backend")

    // 1. Get Default Project for the DB
    let targetProjectUuid = ""
    try {
      const projectsRes = await coolifyFetch("GET", "/projects")
      const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.data || [])
      
      if (projects.length > 0) {
        targetProjectUuid = projects[0].uuid
      } else {
        throw new Error("No se encontró ningún proyecto base en Coolify")
      }
    } catch (e: any) {
      throw new Error(`Fallo descubriendo servidor: ${e.message}`)
    }

    // 2. Format PostgreSQL payload
    if (payload.engine !== "postgresql") {
      throw new Error("Motor no soportado actualmente.")
    }

    const postPayload = {
      server_uuid: COOLIFY_SERVER_UUID,
      project_uuid: targetProjectUuid,
      environment_name: "production",
      name: payload.name,
      postgres_user: payload.user,
      postgres_password: payload.password,
      postgres_db: payload.name, // El nombre interno de base de datos será igual al nombre de recurso
      is_public: !!payload.isPublic,
      instant_deploy: true
    }

    // 3. POST to Coolify
    const dbCreated = await coolifyFetch("POST", "/databases/postgresql", postPayload)
    
    if (!dbCreated || !dbCreated.uuid) {
      throw new Error("Coolify no devolvió el UUID de la base de datos creada.")
    }

    // El host interno de la base de datos es su UUID devuelto por Coolify
    const internalHost = dbCreated.uuid
    const connectionUri = `postgres://${payload.user}:${payload.password}@${internalHost}:5432/${payload.name}`

    // 4. Registrar en nuestra base de datos (Prisma)
    const resource = await prisma.resource.create({
      data: {
        name: payload.name,
        type: "POSTGRES_DB",
        status: "running",
        projectId: projectId,
        config: {
          coolify_uuid: dbCreated.uuid,
          engine: "postgresql",
          db_user: payload.user,
          db_name: payload.name,
          connection_uri: connectionUri,
          is_public: !!payload.isPublic,
          coolify_server: COOLIFY_SERVER_UUID,
          linked_app: payload.linkedAppId || null
        }
      }
    })

    return { 
      success: true, 
      coolifyUuid: dbCreated.uuid,
      connectionString: connectionUri
    }
  } catch(error: any) {
    console.error("Error aprovisionando base de datos:", error)
    return { success: false, error: error.message }
  }
}

// ------------------ ENVIRONMENT VARIABLES (API V4) ------------------ //

async function _getAppUuidSafe(resourceId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("olacloud_session")?.value
  if (!token) throw new Error("No estás autenticado")

  const session = await verifyJWT(token)
  if (!session || !session.sub) throw new Error("Sesión inválida")

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  })

  if (!resource) throw new Error("Recurso no encontrado.")
  const config = typeof resource.config === "string" ? JSON.parse(resource.config) : resource.config
  
  if (!config.coolify_uuid) {
    throw new Error("El recurso no tiene un UUID de Coolify asociado.")
  }

  return config.coolify_uuid
}

export async function getAppEnvVars(resourceId: string) {
  try {
    const uuid = await _getAppUuidSafe(resourceId)
    const envs = await coolifyFetch("GET", `/applications/${uuid}/envs`)
    return { success: true, data: envs }
  } catch (error: any) {
    console.error("Error obteniendo variables de entorno:", error)
    return { success: false, error: error.message }
  }
}

export async function createAppEnvVar(resourceId: string, key: string, value: string, isSecret: boolean) {
  try {
    // Al usar PATCH /bulk, Coolify opera de manera idempotente ("upsert" por Key),
    // resolviendo así cualquier bug de duplicación por lado del servidor (Coolify POST API issue).
    const uuid = await _getAppUuidSafe(resourceId)
    const body = {
      data: [{
        key,
        value,
        is_preview: false,
        is_literal: isSecret
      }]
    }
    const res = await coolifyFetch("PATCH", `/applications/${uuid}/envs/bulk`, body)
    return { success: true, data: res }
  } catch (error: any) {
    console.error("Error creando variable:", error)
    return { success: false, error: error.message }
  }
}

export async function updateAppEnvVar(resourceId: string, key: string, value: string, isSecret: boolean) {
  try {
    // Coolify v4 usa Bulk update por defecto. Basta con enviar el array.
    const uuid = await _getAppUuidSafe(resourceId)
    const body = {
      data: [{
        key,
        value,
        is_preview: false,
        is_literal: isSecret
      }]
    }
    const res = await coolifyFetch("PATCH", `/applications/${uuid}/envs/bulk`, body)
    return { success: true, data: res }
  } catch (error: any) {
    console.error("Error actualizando variable:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteAppEnvVar(resourceId: string, envUuid: string) {
  try {
    const appUuid = await _getAppUuidSafe(resourceId)
    await coolifyFetch("DELETE", `/applications/${appUuid}/envs/${envUuid}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error borrando variable de entorno:", error)
    return { success: false, error: error.message }
  }
}
