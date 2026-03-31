"use client"

import * as React from "react"
import { Rocket, GitBranch, HardDrive, TerminalSquare, Box, Server, Github, Search, Lock, Clock, Unplug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { disconnectGithub } from "@/app/actions/github"
import { deployToCoolify } from "@/app/actions/coolify"

export function DeploymentWizard({ repositories }: { repositories: any[] }) {
  const [framework, setFramework] = React.useState("nextjs")
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [isDisconnecting, setIsDisconnecting] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedRepo, setSelectedRepo] = React.useState<any | null>(null)

  const filteredRepos = repositories.filter(repo => 
    repo.fullName.toLowerCase().includes(search.toLowerCase()) ||
    repo.name.toLowerCase().includes(search.toLowerCase())
  )

  const deploy = async () => {
    if (!selectedRepo) return
    setIsDeploying(true)
    
    const res = await deployToCoolify({
      repoFullName: selectedRepo.fullName,
      branch: selectedRepo.defaultBranch || "main",
      projectName: selectedRepo.name.toLowerCase(),
      framework: framework,
      isPrivate: selectedRepo.private
    })

    if (res.success) {
      // Redirigir a una pantalla de la app o logs (Fase 5)
      // Por ahora mandamos a Proyectos genérico
      window.location.href = `/projects`
    } else {
      setIsDeploying(false)
      alert("Error desplegando en Coolify: " + res.error)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    const res = await disconnectGithub()
    if (res.success) {
      window.location.href = "/projects/new"
    } else {
      setIsDisconnecting(false)
      alert("Error al desconectar GitHub")
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Left Col - Wizard Form */}
      <div className="md:col-span-2 space-y-6">
        
        {/* REPOSITORIOS OAUTH */}
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="text-muted-foreground hover:text-destructive hover:border-destructive/30 border-border/50"
              >
                {isDisconnecting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Unplug className="h-4 w-4 mr-2" />
                )}
                Desconectar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar repositorio..." 
                className="pl-9 bg-background/50" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="rounded-md border border-border/50 bg-background/30 max-h-[340px] overflow-y-auto">
              {filteredRepos.length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                  <Github className="h-8 w-8 opacity-20" />
                  No se encontraron repositorios.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredRepos.map((repo) => (
                    <div 
                      key={repo.id} 
                      className={`flex items-center justify-between p-4 transition-colors hover:bg-muted/50 ${selectedRepo?.id === repo.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border shadow-sm">
                          <Github className="h-5 w-5 text-foreground/80" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{repo.name}</span>
                            {repo.private && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-primary/70"></span>
                              {repo.language || "Unknown"}
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              <span className="opacity-50">•</span>
                              <Clock className="h-3 w-3 ml-1" />
                              {new Date(repo.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant={selectedRepo?.id === repo.id ? "secondary" : "default"}
                        size="sm"
                        className="shrink-0 ml-4 shadow-sm"
                        onClick={() => setSelectedRepo(repo)}
                      >
                        {selectedRepo?.id === repo.id ? "Seleccionado" : "Importar"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SETTINGS MANUALES */}
        <Card className={`bg-card/40 border-border/50 transition-opacity ${!selectedRepo ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle>Configuración de Despliegue</CardTitle>
            <CardDescription>
              Personaliza el entorno y comandos para {selectedRepo?.name || "tu proyecto"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Nombre del Proyecto
              </label>
              <Input 
                placeholder="Selecciona un repositorio primero" 
                className="bg-background/50" 
                value={selectedRepo ? selectedRepo.name.toLowerCase() : ""}
                readOnly
              />
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

        <Card className={`bg-card/40 border-border/50 transition-opacity ${!selectedRepo ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle>Entorno de Ejecución Automático</CardTitle>
            <CardDescription>
              Nixpacks detectará esto automáticamente. Puedes forzar uno.
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
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50"
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
      <div className="space-y-6 lg:sticky lg:top-8 self-start">
        <Card className="border-primary/20 bg-card/60 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Despliegue Virtual Machine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border/50 pb-2 items-center">
              <span className="font-medium flex items-center gap-2 text-foreground">
                <Server className="w-4 h-4 text-primary"/> VM
              </span>
              <span className="font-semibold text-sm">AMD EPYC non GPU</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2 items-center">
              <span className="text-muted-foreground">Rama Auto-Deploy</span>
              <span className="font-medium flex items-center gap-1">
                <GitBranch className="w-3 h-3 shrink-0"/> {selectedRepo ? selectedRepo.defaultBranch : "main"}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-primary-foreground font-semibold" 
              size="lg"
              onClick={deploy}
              disabled={!selectedRepo || isDeploying}
            >
              {isDeploying ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Iniciando Instancia...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  {selectedRepo ? "Lanzar Aplicación" : "Esperando Repositorio..."}
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Cost Estimates */}
        <Card className="bg-card/40 border-border/50 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Cost estimate</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              eu-north1 <span className="text-xl leading-none" title="Finland">🇫🇮</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-[0.85rem]">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Non-GPU AMD Epyc. CPU: <span className="text-foreground font-medium">8 vCPU</span></span>
              <span className="font-bold text-foreground">$0.1/hour</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Non-GPU AMD Epyc. RAM: <span className="text-foreground font-medium">32 GiB</span></span>
              <span className="font-bold text-foreground">$0.11/hour</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Network SSD disk: <span className="text-foreground font-medium">1280 GiB</span></span>
              <span className="font-bold text-foreground">$0.13/hour</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
