"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { signJWT } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()

  if (!email || !password) {
    return { error: "Por favor, completa todos los campos." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "Credenciales incorrectas." }
    }

    // Hash check placeholder (We used plain text mock string in seed)
    if (user.password !== password) {
      return { error: "Credenciales incorrectas." }
    }

    // 1. Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    }
    const token = await signJWT(payload)

    // 2. Set Cookie (Next.js 15+ compatible await cookies())
    const cookieStore = await cookies()
    cookieStore.set("olacloud_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    
    // Devolver objeto success explícito
    return { success: true }

  } catch (err: any) {
    console.error("Error validando el login:", err)
    return { error: "Error Prisma Action: " + (err?.message || String(err)) }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("olacloud_session")
  redirect("/login")
}
