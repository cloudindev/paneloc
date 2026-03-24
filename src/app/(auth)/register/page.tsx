"use client"

import * as React from "react"
import Link from "next/link"
import { CloudLightning, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { registerAction } from "@/app/actions/auth"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)
    
    // Si envolvemos en try-catch evitamos que el promesa crashee el front si el backend falla estructuralmente.
    try {
      const formData = new FormData(e.currentTarget)
      const result = await registerAction(formData)
      
      if (result && result.error) {
        setErrorMsg(result.error)
        setIsLoading(false)
      } else if (result && result.success) {
        window.location.href = "/" // Redirección exitosa garantizada
      }
    } catch (error: any) {
      console.error(error)
      setErrorMsg("Error de conexión con el Servidor: " + (error?.message || String(error)))
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center justify-center space-y-2">
        <Link href="https://olacloud.es" className="flex flex-col items-center justify-center space-y-2 transition-opacity hover:opacity-80">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
            <CloudLightning className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            OLA <span className="font-light text-primary">CLOUD</span>
          </h1>
        </Link>
        <p className="text-sm text-muted-foreground">
          Premium infrastructure for your applications
        </p>
      </div>

      <Card className="glass-panel border-border/40">
        <form onSubmit={onSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Crear Cuenta</CardTitle>
            <CardDescription>
              Configura tu usuario y el entorno de tu nueva Organización.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
                {errorMsg}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">
                  Nombre Completo
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Steve Jobs"
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="organizationName" className="text-sm font-medium leading-none">
                  Empresa/Organización
                </label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  placeholder="Apple Inc."
                  required
                  className="bg-background/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ceo@empresa.com"
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••••••"
                required
                minLength={8}
                className="bg-background/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creando Entorno...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Registrarse y Entrar <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            
            <div className="mt-4 text-center text-sm w-full">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia Sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros <Link href="/privacy" target="_blank" className="underline hover:text-primary">Términos y Política de privacidad</Link>.
      </p>
    </div>
  )
}

/**
 * 📝 Documentación de Memoria:
 * - Se asimilan inputs multitenant ('organizationName') para pasarlos empaquetados en FormData.
 * - Validación minLength={8} a nivel cliente.
 * - Manejo en try-catch explícito del RPC de Next.js Server Actions para evitar 500s opacos en producción. 
 *   (Lección aprendida sobre la arquitectura Server Component error masking).
 */
