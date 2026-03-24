"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Globe2, Server, TerminalSquare, ExternalLink, Activity, Github, Settings, RefreshCw, KeyRound, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getLiveProjectStatus } from "@/app/actions/coolify"

export function ProjectDetailView({ initialResource }: { initialResource: any }) {
  const [resource, setResource] = React.useState(initialResource)
  const [activeTab, setActiveTab] = React.useState("general")
  const [liveData, setLiveData] = React.useState<any>(null)
  
  React.useEffect(() => {
    if (!resource.config?.coolify_uuid) return

    const fetchLive = async () => {
      const live = await getLiveProjectStatus(resource.config.coolify_uuid)
      if (live.success) {
        setLiveData(live)
      }
    }
    
    fetchLive()
    const interval = setInterval(fetchLive, 5000)
    return () => clearInterval(interval)
  }, [resource.config?.coolify_uuid])

  const status = (liveData?.status || resource.status).toLowerCase()
  const domain = liveData?.fqdn || resource.config?.domain

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              {resource.config?.framework === 'nextjs' ? <Globe2 className="h-6 w-6 text-primary" /> : <Server className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{resource.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={status.includes("running") ? "success" : "secondary"} className="capitalize">
                  {status}
                </Badge>
                {domain && (
                  <a href={domain.startsWith("http") ? domain : `http://${domain}`} target="_blank" rel="noreferrer" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    {domain.replace(/^https?:\/\//, '')} <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> REINICIAR
          </Button>
          <Button variant="default" className="gap-2">
            VISITAR VISTA PREVIA
          </Button>
        </div>
      </div>

      {/* SIDEBAR TABS LAYOUT */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button onClick={() => setActiveTab("general")} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === "general" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            <Activity className="h-4 w-4" /> General
          </button>
          <button onClick={() => setActiveTab("deployments")} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === "deployments" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            <TerminalSquare className="h-4 w-4" /> Despliegues y Logs
          </button>
          <button onClick={() => setActiveTab("env")} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === "env" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            <KeyRound className="h-4 w-4" /> Variables de Entorno
          </button>
          <button onClick={() => setActiveTab("storage")} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === "storage" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            <Database className="h-4 w-4" /> Almacenamiento
          </button>
          <button onClick={() => setActiveTab("settings")} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === "settings" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            <Settings className="h-4 w-4" /> Ajustes
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === "general" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Producción</CardTitle>
                  <CardDescription>Información del entorno principal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Dominio</span>
                    <span className="font-medium text-foreground">{domain || "Sin Dominio"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Estado</span>
                    <span className="font-medium text-emerald-500 capitalize">{status}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Actualizado</span>
                    <span className="font-medium text-foreground">{liveData?.updated_at ? new Date(liveData.updated_at).toLocaleString() : "..."}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Motor</span>
                    <span className="font-medium text-foreground capitalize">{resource.config?.build_pack || "Nixpacks"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Repositorio Git</CardTitle>
                  <CardDescription>Código fuente conectado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">URL</span>
                    <a href={`https://github.com/${resource.config?.repo}`} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                       <Github className="h-3 w-3" /> {resource.config?.repo}
                    </a>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Rama (Branch)</span>
                    <span className="font-mono text-foreground">{resource.config?.branch || "main"}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Auto-Despliegue</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Activado</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "deployments" && (
            <Card className="bg-card/40 backdrop-blur-sm border-dashed">
              <CardHeader>
                <CardTitle>Historial de Despliegues</CardTitle>
                <CardDescription>Monitorización en tiempo real de compilaciones Nixpacks.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <TerminalSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground max-w-sm">Estamos conectando los WebSockets de logs remotos con Coolify. Estará disponible en la siguiente iteración.</p>
                <Button variant="outline" className="mt-6">Cargar Logs Manualmente</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "env" && (
            <Card className="bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Variables de Entorno</CardTitle>
                <CardDescription>Gestiona de forma segura los secretos inyectados en producción.</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea 
                  className="w-full h-48 p-4 font-mono text-sm bg-background border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="PORT=3000&#10;DATABASE_URL=postgres://..."
                  readOnly
                ></textarea>
                <div className="flex justify-end mt-4">
                  <Button disabled>Sincronizar Secretos</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(activeTab === "settings" || activeTab === "storage") && (
            <div className="py-12 text-center border rounded-xl bg-card/20 border-dashed">
              <h3 className="text-lg font-medium text-muted-foreground mb-1">Módulo en Desarrollo</h3>
              <p className="text-sm text-muted-foreground">Esta sección será habilitada en la Fase 6 de la arquitectura OLA CLOUD.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
