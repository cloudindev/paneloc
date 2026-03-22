"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Rocket, GitBranch, HardDrive, TerminalSquare, Box, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewProjectPage() {
  const [framework, setFramework] = React.useState("nextjs")
  const [isDeploying, setIsDeploying] = React.useState(false)

  const deploy = () => {
    setIsDeploying(true)
    setTimeout(() => {
      window.location.href = "/projects"
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-3 text-muted-foreground">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Desplegar Nueva App</h1>
        <p className="text-muted-foreground mt-1">
          Configura y lanza tu servicio en segundos. Nuestro platform as a service se encarga del resto.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Col - Wizard Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/40 border-border/50">
            <CardHeader>
              <CardTitle>Configuración Básica</CardTitle>
              <CardDescription>
                Detalles principales de tu nuevo despliegue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Nombre del Proyecto
                </label>
                <Input placeholder="mi-super-app" className="bg-background/50" />
                <p className="text-xs text-muted-foreground">
                  Se usará para generar el subdominio gratuito inicial.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <label className="text-sm font-medium leading-none">
                  Entorno Destino
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex cursor-pointer items-center rounded-lg border border-primary bg-primary/10 p-4 transition-colors">
                    <Server className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium">Producción</p>
                      <p className="text-xs text-muted-foreground">Alta disponibilidad y caché edge</p>
                    </div>
                  </div>
                  <div className="flex cursor-pointer items-center rounded-lg border border-border/50 bg-background/50 p-4 transition-colors hover:border-primary/50">
                    <GitBranch className="h-5 w-5 text-muted-foreground mr-3" />
                    <div>
                      <p className="font-medium text-muted-foreground">Staging / Preview</p>
                      <p className="text-xs text-muted-foreground">Para pruebas antes del release</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50">
            <CardHeader>
              <CardTitle>Entorno de Ejecución</CardTitle>
              <CardDescription>
                Selecciona la tecnología base de tu aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { id: "nextjs", label: "Next.js", icon: Box },
                  { id: "nodejs", label: "Node.js", icon: TerminalSquare },
                  { id: "python", label: "Python", icon: TerminalSquare },
                  { id: "docker", label: "Docker", icon: HardDrive },
                ].map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setFramework(fw.id)}
                    className={`flex flex-col items-center justify-center space-y-2 rounded-xl border p-4 transition-colors ${
                      framework === fw.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <fw.icon className={`h-8 w-8 ${framework === fw.id ? "text-primary" : ""}`} />
                    <span className="text-sm font-medium">{fw.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col - Summary */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 bg-card/60 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Despliegue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Región</span>
                <span className="font-medium">EU-West (Madrid)</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Recursos</span>
                <span className="font-medium">Autoscaling (1-3)</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Dominio Inicial</span>
                <span className="font-medium text-xs truncate max-w-[140px]">mi-super-app.onola.cloud</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full text-primary-foreground font-semibold" 
                size="lg"
                onClick={deploy}
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Iniciando Instancia...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Lanzar Aplicación
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
/**
 * OLA CLOUD - Deploy New App Wizard
 * Creation flow featuring interactive cards and premium styling with sticky summary sidebar.
 */
