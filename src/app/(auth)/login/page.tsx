"use client"

import * as React from "react"
import Link from "next/link"
import { CloudLightning, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { loginAction } from "@/app/actions/auth"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(null, formData)
    
    if (result && result.error) {
      setErrorMsg(result.error)
      setIsLoading(false)
    } else if (result && result.success) {
      window.location.href = "/"
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center justify-center space-y-2">
        <Link href="https://olacloud.es" className="group relative flex items-center justify-center w-[160px] h-[52px]">
          {/* Logo principal en su estado base (blanco) */}
          <img 
            src="/ola-logo.png" 
            alt="OLA CLOUD" 
            className="object-contain w-full h-full"
          />
          {/* Capa Mágica Superpuesta (Se revela al hacer el Hover) */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 logo-shimmer"
            style={{
              WebkitMaskImage: 'url(/ola-logo.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              clipPath: 'polygon(36% 0%, 100% 0%, 100% 100%, 39.5% 100%)'
            }}
          />
        </Link>
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
            {errorMsg && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
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
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
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
          <CardFooter className="flex-col gap-4">
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
            
            <div className="mt-4 text-center text-sm w-full">
              <span className="text-muted-foreground">¿Aún no tienes cuenta? </span>
              <Link href="/register" className="font-medium text-primary hover:underline">
                Crea una gratis
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Al iniciar sesión, aceptas nuestra <Link href="/privacy" target="_blank" className="underline hover:text-primary">Política de privacidad</Link>.
      </p>
    </div>
  )
}
/**
 * OLA CLOUD - Login Page
 * Impressive entry point with glassmorphism forms and subtle interactions.
 */
