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

      {/* CONTENT AREA (General Overview Context) */}
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
    </div>
  )
}
