import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = `${protocol}://${host}`

  const clientId = process.env.GITHUB_CLIENT_ID
  
  if (!clientId) {
    return NextResponse.redirect(new URL("/projects/new?error=GITHUB_CLIENT_ID no configurado en el servidor. Por favor, añádelo en las variables de entorno de Coolify.", origin))
  }

  // Permisos: read:user (para info del perfil), user:email (para correo obvio), 
  // repo (para leer listado de repositorios, incluyendo privados si hiciera falta)
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,user:email,repo&prompt=consent`
  
  return NextResponse.redirect(redirectUri)
}
