import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID
  
  if (!clientId) {
    return NextResponse.json({ error: "GITHUB_CLIENT_ID no configurado en el servidor" }, { status: 500 })
  }

  // Permisos: read:user (para info del perfil), user:email (para correo obvio), 
  // repo (para leer listado de repositorios, incluyendo privados si hiciera falta)
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,user:email,repo&prompt=consent`
  
  return NextResponse.redirect(redirectUri)
}
