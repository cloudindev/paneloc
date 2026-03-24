"use client"

import * as React from "react"
import { Rocket, GitBranch, HardDrive, TerminalSquare, Box, Server, Github, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function DeploymentWizard() {
  const [framework, setFramework] = React.useState("nextjs")
  const [isDeploying, setIsDeploying] = React.useState(false)

  const deploy = () => {
    setIsDeploying(true)
    setTimeout(() => {
      window.location.href = "/projects"
    }, 2000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Left Col - Wizard Form */}
      <div className="md:col-span-2 space-y-6">
        
        {/* REPOSITORIOS OAUTH (Mock por ahora, Fase 2 los rellenará) */}
        <Card className="bg-card/40 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Importar Repositorio
                </CardTitle>
                <CardDescription>
                  Selecciona uno de tus repositorios conectados.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar repositorio..." className="pl-9 bg-background/50" />
            </div>
            <div className="rounded-md border border-border/50 bg-background/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Cargando repositorios... (Fase 2)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SETTINGS MANUALES */}
        <Card className="bg-card/40 border-border/50 opacity-50 pointer-events-none">
          <CardHeader>
            <CardTitle>Configuración de Despliegue</CardTitle>
            <CardDescription>
              Personaliza el entorno y comandos (Se activará tras importar repo).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Nombre del Proyecto
              </label>
              <Input placeholder="mi-super-app" disabled className="bg-background/50" />
              <p className="text-xs text-muted-foreground">
                Se usará para generar el subdominio gratuito inicial.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <label className="text-sm font-medium leading-none">
                Entorno Destino (Docker Node)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex cursor-pointer items-center rounded-lg border border-primary bg-primary/10 p-4 transition-colors">
                  <Server className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">VM102 (Producción)</p>
                    <p className="text-xs text-muted-foreground">Edge Router Activo</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50 opacity-50 pointer-events-none">
          <CardHeader>
            <CardTitle>Entorno de Ejecución Automático</CardTitle>
            <CardDescription>
              Nixpacks detectará esto automáticamente.
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
                  disabled
                  className={`flex flex-col items-center justify-center space-y-2 rounded-xl border p-4 transition-colors ${
                    framework === fw.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-background/50 text-muted-foreground"
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
              <span className="text-muted-foreground">Infraestructura</span>
              <span className="font-medium flex items-center gap-1"><Server className="w-3 h-3"/> VM102</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Directorio</span>
              <span className="font-medium">/</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Rama Auto-Deploy</span>
              <span className="font-medium flex items-center gap-1"><GitBranch className="w-3 h-3"/> main</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-primary-foreground font-semibold" 
              size="lg"
              onClick={deploy}
              disabled={true}
            >
              <span className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Esperando Repositorio...
              </span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
