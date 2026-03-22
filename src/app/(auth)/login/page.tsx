"use client"

import * as React from "react"
import Link from "next/link"
import { CloudLightning, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      window.location.href = "/" // Mock redirect to dashboard
    }, 1000)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center justify-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
          <CloudLightning className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          OLA <span className="font-light text-primary">CLOUD</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Premium infrastructure for your applications
        </p>
      </div>

      <Card className="glass-panel border-border/40">
        <form onSubmit={onSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Introduce tu correo y contraseña para acceder al panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Contraseña
                </label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="bg-background/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-input bg-background/50 text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Recordar sesión
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Conectando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Acceder al Panel <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Al iniciar sesión, aceptas nuestros <Link href="#" className="underline hover:text-primary">Términos de servicio</Link> y <Link href="#" className="underline hover:text-primary">Política de privacidad</Link>.
      </p>
    </div>
  )
}
/**
 * OLA CLOUD - Login Page
 * Impressive entry point with glassmorphism forms and subtle interactions.
 */
