"use client"

import * as React from "react"
import Link from "next/link"
import { CloudLightning, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import OlaLogo from "@/components/OlaLogo"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center justify-center space-y-2">
        <Link href="https://olacloud.es" className="flex items-center justify-center">
          <OlaLogo />
        </Link>
        <p className="text-sm text-muted-foreground">
          Recuperación de acceso al panel
        </p>
      </div>

      <Card className="glass-panel border-border/40">
        {!isSubmitted ? (
          <form onSubmit={onSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Restablecer contraseña</CardTitle>
              <CardDescription>
                Introduce el correo asociado a tu cuenta y te enviaremos un enlace para crear una nueva clave.
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
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                     <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Enviando enlace...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Enviar código de recuperación <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
              
              <div className="text-center text-sm w-full">
                <span className="text-muted-foreground">¿Recordaste tu clave? </span>
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Volver a iniciar sesión
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <div className="py-6 px-4 text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl mb-2">Revisa tu correo</CardTitle>
              <CardDescription>
                Si existe una cuenta asocida a ese correo, te acabamos de enviar instrucciones para restablecer tu contraseña con éxito.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col mt-4">
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="outline">
                  Volver al Login
                </Button>
              </Link>
            </CardFooter>
          </div>
        )}
      </Card>
      
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Si tienes problemas, contacta con nuestro <Link href="#" className="underline hover:text-primary">Soporte Técnico</Link>.
      </p>
    </div>
  )
}
/**
 * OLA CLOUD - Forgot Password Page
 * Implements a mock state switch once the user submits their email.
 */
