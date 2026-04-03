"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Globe2, Server, TerminalSquare, ExternalLink, Activity, Github, Settings, RefreshCw, KeyRound, Database, PlusCircle, GitBranch, GitCommit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getLiveProjectStatus, getApplicationDeployments } from "@/app/actions/coolify"

export function ProjectDetailView({ initialResource }: { initialResource: any }) {
  const [resource, setResource] = React.useState(initialResource)
  const [liveData, setLiveData] = React.useState<any>(null)
  const [latestDeploy, setLatestDeploy] = React.useState<any>(null)
  
  React.useEffect(() => {
    if (!resource.config?.coolify_uuid) return

    const fetchLive = async () => {
      const liveReq = getLiveProjectStatus(resource.config.coolify_uuid)
      const deployReq = getApplicationDeployments(resource.config.coolify_uuid)
      
      const [live, deploys] = await Promise.all([liveReq, deployReq])
      
      if (live.success) {
        setLiveData(live)
      }
      if (deploys.success && deploys.deployments?.length > 0) {
        setLatestDeploy(deploys.deployments[0])
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
          <Button variant="default" className="gap-2" asChild disabled={!domain}>
            <a href={domain ? (domain.startsWith("http") ? domain : `https://${domain}`) : "#"} target="_blank" rel="noreferrer">
              VISITAR VISTA PREVIA <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* CONTENT AREA (Vercel-style Unified Overview) */}
      <Card className="bg-card/40 backdrop-blur-sm border-border/50 overflow-hidden">
        <div className="grid md:grid-cols-5 gap-0">
          {/* Left Side: Screenshot */}
          <div className="md:col-span-2 border-r border-border/50 bg-muted/10 relative min-h-[300px] flex items-center justify-center p-0">
            {domain ? (
              <div className="absolute inset-0 w-full h-full p-6 flex flex-col items-center justify-center">
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                  {/* Using a scaled iframe instead of mshots to guarantee a real-time preview without 3rd party API 404s */}
                  <iframe 
                      src={domain.startsWith('http') ? domain : `https://${domain}`} 
                      className="absolute top-0 left-0 w-[300%] h-[300%] border-0 opacity-100 origin-top-left animate-in fade-in transition-[opacity,transform] duration-1000 bg-white"
                      style={{ 
                        transform: 'scale(0.333333)',
                        pointerEvents: 'none',
                        userSelect: 'none'
                      }}
                      tabIndex={-1}
                      title="Live Preview"
                  />
                  {/* Overlay to prevent ANY interaction and add a slight gradient */}
                  <div className="absolute inset-0 bg-transparent z-10" />
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center">
                <Globe2 className="h-8 w-8 mb-2 opacity-20" />
                <span className="text-sm">Sin dominio público</span>
              </div>
            )}
          </div>

          {/* Right Side: Data */}
          <div className="md:col-span-3 p-6 lg:p-8 flex flex-col justify-center space-y-8">
            
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-muted-foreground">Deployment</h3>
              <a href={domain?.startsWith("http") ? domain : `https://${domain}`} target="_blank" rel="noreferrer" className="text-[15px] font-semibold hover:underline flex items-center gap-1.5 w-fit text-foreground">
                {liveData?.fqdn || resource.config?.domain || "Configurando..."}
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">Domains</h3>
                <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full"><PlusCircle className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {domain ? (
                    <a href={domain.startsWith("http") ? domain : `https://${domain}`} target="_blank" rel="noreferrer" className="text-[15px] font-semibold hover:underline flex items-center gap-1.5 text-foreground">
                      {domain.replace(/^https?:\/\//, '')} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  ) : (
                    <span className="text-[15px] font-semibold text-muted-foreground">No configurado</span>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${status.includes("running") ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-yellow-500'}`} />
                    <span className="text-[15px] font-medium text-foreground flex items-center gap-1.5">
                      {status.includes("running") ? "Ready" : status} 
                      <span className="text-[13px] text-muted-foreground font-normal ml-1">
                        {latestDeploy?.created_at ? (() => {
                          const d = new Date(latestDeploy.created_at)
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                          return `${d.getDate()} ${months[d.getMonth()]} by system`
                        })() : (liveData?.updated_at ? "Updated" : "")}
                      </span>
                    </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Motor</h3>
                <span className="text-[15px] font-medium capitalize text-foreground">{resource.config?.build_pack || "Nixpacks"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
              <div className="flex items-center gap-2 text-[15px] font-medium text-foreground">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span>{resource.config?.branch || "main"}</span>
              </div>
              {latestDeploy && (
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground mt-1.5">
                  <GitCommit className="h-3.5 w-3.5 ml-0.5" />
                  <span className="font-mono text-xs">{latestDeploy.commit?.substring(0, 7) || "Manual"}</span>
                  <span className="truncate max-w-[300px] text-foreground/80">{latestDeploy.commit_message || "Despliegue inicial"}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </Card>
    </div>
  )
}
