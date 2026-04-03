import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { triggerDeploymentInternal } from "@/app/actions/coolify"

export async function POST(req: Request) {
  try {
    let payload;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData()
      const payloadStr = formData.get("payload")
      if (typeof payloadStr === "string") {
        payload = JSON.parse(payloadStr)
      } else {
         return NextResponse.json({ error: "No payload found in form-data" }, { status: 400 })
      }
    } else {
      payload = await req.json()
    }

    // 1. Manejar ping event de GitHub
    if (payload.zen) {
      return NextResponse.json({ success: true, message: "Ping event received successfully" })
    }

    // 2. Solo actuamos si es un evento push con repositorio
    if (!payload.repository || !payload.ref) {
      return NextResponse.json({ error: "No es un push event válido o falta payload" }, { status: 400 })
    }

    const repoFullName = payload.repository.full_name
    const branch = payload.ref.replace("refs/heads/", "")

    console.log(`[GitHub Webhook] Push recibido en ${repoFullName} rama ${branch}`)

    // 3. Buscar todas las apps que usen este repo y rama
    const allWebServices = await prisma.resource.findMany({
      where: { type: "WEB_SERVICE" }
    })

    const matchingResources = allWebServices.filter(r => {
      let config = r.config as any
      if (typeof config === "string") {
        try {
          config = JSON.parse(config)
        } catch {
          return false
        }
      }
      return config && 
             config.repo?.toLowerCase() === repoFullName.toLowerCase() && 
             config.branch?.toLowerCase() === branch.toLowerCase()
    })

    if (matchingResources.length === 0) {
       console.log(`[GitHub Webhook] No se encontró ninguna app para ${repoFullName}:${branch}`)
       return NextResponse.json({ success: true, message: "Webhook ignorado: Ninguna app configurada para ese repo/rama" })
    }

    // 4. Disparar el deploy en Coolify para cada app vinculada
    const results = []
    for (const res of matchingResources) {
      let config = res.config as any
      if (typeof config === "string") {
        try {
          config = JSON.parse(config)
        } catch {
          continue
        }
      }
      if (config.coolify_uuid) {
         console.log(`[GitHub Webhook] Forzando redespliegue de ${res.name} (UUID: ${config.coolify_uuid})...`)
         // El segundo argumento es force=false
         const deployRes = await triggerDeploymentInternal(config.coolify_uuid, false)
         results.push({ id: res.id, name: res.name, coolifyResponse: deployRes })
      }
    }

    return NextResponse.json({ success: true, triggers: results })

  } catch (error: any) {
    console.error("[GitHub Webhook] Error interno procesando el payload:", error)
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 })
  }
}
