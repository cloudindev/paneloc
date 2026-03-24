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
    
    if (!session || !session.sub) {
      return { isConnected: false }
    }
    
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

export async function getGithubRepositories() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("olacloud_session")?.value
    if (!token) throw new Error("No session found")

    const session = await verifyJWT(token)
    if (!session || !session.sub) throw new Error("Invalid session")

    const integration = await prisma.integration.findFirst({
      where: {
        userId: session.sub,
        provider: "github"
      }
    })

    if (!integration || !integration.accessToken) {
      throw new Error("GitHub not connected")
    }

    const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        "User-Agent": "OLA-CLOUD-App",
        Accept: "application/vnd.github.v3+json"
      },
      next: { revalidate: 60 } // Cache per 1 min
    })

    if (!res.ok) {
      if (res.status === 401) {
        // Token revocado o expirado
        await prisma.integration.delete({ where: { id: integration.id } })
        throw new Error("GitHub token is no longer valid")
      }
      throw new Error(`GitHub API error: ${res.statusText}`)
    }

    const repos = await res.json()
    
    return repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      private: r.private,
      url: r.html_url,
      language: r.language,
      updatedAt: r.updated_at,
      defaultBranch: r.default_branch
    }))

  } catch (error) {
    console.error("Error fetching github repos:", error)
    return []
  }
}
