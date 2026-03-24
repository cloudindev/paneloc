"use server"

import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function checkGithubConnection() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) return { isConnected: false }

    const session = await verifyJWT(token)
    
    const integration = await prisma.integration.findFirst({
      where: {
        userId: session.sub,
        provider: "github"
      }
    })

    return { 
      isConnected: !!integration,
      username: integration ? "Connected" : null // Podríamos guardar el username en DB para mostrarlo
    }
  } catch (error) {
    console.error("Error checking github auth:", error)
    return { isConnected: false }
  }
}
