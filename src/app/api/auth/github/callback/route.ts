import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = `${protocol}://${host}`

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/projects/new?error=Code no proporcionado desde GitHub.", origin))
  }

  // Verificar sesión actual (el usuario debe estar logueado para conectar su GitHub)
  const cookieStore = await cookies()
  const token = cookieStore.get("olacloud_session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=Se requiere iniciar sesión antes de conectar GitHub", origin))
  }

  let session: any
  try {
    session = await verifyJWT(token)
  } catch (error) {
    return NextResponse.redirect(new URL("/login?error=Sesión inválida al conectar GitHub", origin))
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/projects/new?error=Credenciales de GitHub (CLIENT_ID o CLIENT_SECRET) no configuradas en el servidor. Por favor, revisa tus variables en Coolify.", origin))
  }

  try {
    // 1. Intercambiar code por Access Token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      })
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      console.error("GitHub Auth Error intercambiando código:", tokenData)
      return NextResponse.redirect(new URL("/projects/new?error=Error intercambiando el código de GitHub (Revisa el Client Secret)", origin))
    }

    // 2. Obtener identidad básica del usuario en GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "OLA-CLOUD-App"
      }
    })

    const githubUser = await userResponse.json()
    
    // 3. Guardar o actualizar la integración OAuth en la Base de Datos
    await prisma.integration.upsert({
      where: {
        provider_providerId: {
          provider: "github",
          providerId: githubUser.id.toString()
        }
      },
      update: {
        accessToken: accessToken,
        userId: session.sub, // Vinculamos estricto al usuario logado
      },
      create: {
        provider: "github",
        providerId: githubUser.id.toString(),
        accessToken: accessToken,
        userId: session.sub,
      }
    })

    // Éxito: Volvemos a la vista de "Nueva App" donde el UI ahora verá la conexión activada
    return NextResponse.redirect(new URL("/projects/new?github_connected=true", origin))

  } catch (error: any) {
    console.error("Error grave en callback de GitHub:", error)
    return NextResponse.redirect(new URL("/projects/new?error=Error interno conectando con GitHub", origin))
  }
}
