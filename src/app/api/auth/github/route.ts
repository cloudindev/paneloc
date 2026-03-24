import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // Traefik en Coolify a veces reescribe el Host al FQDN interno (sslip.io). 
  // La forma más robusta es usar la variable de entorno o tu dominio fijo de producción.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://panel.olacloud.es"
  const origin = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl

  const clientId = process.env.GITHUB_CLIENT_ID
  
  if (!clientId) {
    return NextResponse.redirect(new URL("/projects/new?error=GITHUB_CLIENT_ID no configurado en el servidor. Por favor, añádelo en las variables de entorno de Coolify.", origin))
  }

  // Permisos: read:user (para info del perfil), user:email (para correo obvio), 
  // repo (para leer listado de repositorios, incluyendo privados si hiciera falta)
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,user:email,repo&prompt=consent`
  
  return NextResponse.redirect(redirectUri)
}
