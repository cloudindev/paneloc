"use client"

import * as React from "react"
import Link from "next/link"
import { CloudLightning, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      window.location.href = "/" // Mock redirect to dashboard
    }, 1500)
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
          Crea tu cuenta y empieza a desplegar en segundos.
        </p>
      </div>

      <Card className="glass-panel border-border/40">
        <form onSubmit={onSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Regístrate</CardTitle>
            <CardDescription>
              Introduce tus datos para crear una nueva cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Nombre Completo
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
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
                type="password"
                placeholder="••••••••"
                required
                className="bg-background/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creando cuenta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Crear Cuenta <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros <Link href="#" className="underline hover:text-primary">Términos de servicio</Link> y <Link href="#" className="underline hover:text-primary">Política de privacidad</Link>.
      </p>
    </div>
  )
}
/**
 * OLA CLOUD - Register Page
 * Impressive entry point with glassmorphism forms and subtle interactions.
 * 
 * Lessons Learned:
 * - Always provide a way to switch between login and register views to enhance UI flow.
 */
