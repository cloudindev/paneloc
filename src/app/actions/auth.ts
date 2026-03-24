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
    return { error: "Error interno del servidor. Inténtalo más tarde." }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("olacloud_session")
  redirect("/login")
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name")?.toString()
  const organizationName = formData.get("organizationName")?.toString()
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()

  if (!name || !organizationName || !email || !password) {
    return { error: "Por favor, completa todos los campos." }
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." }
  }

  // Comprobar si usuario ya existe
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "Este correo electrónico ya está registrado." }
    }

    // Slug generator básico
    const slug = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    
    // Verificamos si la organización existe por slug
    const existingOrg = await prisma.organization.findUnique({ where: { slug } })
    const finalSlug = existingOrg ? `${slug}-${Date.now().toString().slice(-4)}` : slug

    // Transaction Atómica: Creación de User -> Organization -> Member
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // En un sistema real esto iría hasheado
        memberships: {
          create: {
            role: "OWNER",
            organization: {
              create: {
                name: organizationName,
                slug: finalSlug,
                plan: "free"
              }
            }
          }
        }
      }
    })

    // Generar JWT
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    }
    const token = await signJWT(payload)

    // Establecer Cookie (Next.js 15+)
    const cookieStore = await cookies()
    cookieStore.set("olacloud_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return { success: true }
  } catch (err: any) {
    console.error("Error validando el registro:", err)
    return { error: "Error interno del servidor registrando la cuenta B2B." }
  }
}

