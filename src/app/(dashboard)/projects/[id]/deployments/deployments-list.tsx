"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCw, GitCommit, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { getApplicationDeployments, triggerDeployment } from "@/app/actions/coolify"
import { useRouter } from "next/navigation"

export function DeploymentsList({ resource, initialDeployments }: { resource: any, initialDeployments: any[] }) {
  const [deployments, setDeployments] = React.useState(initialDeployments)
  const [isDeploying, setIsDeploying] = React.useState(false)
  const router = useRouter()
  const config = resource.config as any

  const hasActiveDeployment = deployments.some(d => d.status === 'in_progress' || d.status === 'queued')

  React.useEffect(() => {
    if (!hasActiveDeployment || !config?.coolify_uuid) return

    const interval = setInterval(async () => {
      const res = await getApplicationDeployments(config.coolify_uuid)
      if (res.success) {
        setDeployments(res.deployments)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [hasActiveDeployment, config?.coolify_uuid])

  const handleRedeploy = async () => {
    if (!config?.coolify_uuid) return
    setIsDeploying(true)
    const res = await triggerDeployment(config.coolify_uuid, false)
    if (res.success) {
      // Refresh list immediately
      const listRes = await getApplicationDeployments(config.coolify_uuid)
      if (listRes.success) {
        setDeployments(listRes.deployments)
      } else {
        // Fallback optimista
        setDeployments([{ uuid: 'temp', status: 'queued', created_at: new Date().toISOString() }, ...deployments])
      }
    } else {
      alert(`Error al desencadenar el despliegue: ${res.error}`)
    }
    setIsDeploying(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finished':
        return <span className="flex w-max items-center text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs font-medium"><CheckCircle2 className="w-3 h-3 mr-1" /> Finished</span>
      case 'failed':
      case 'error':
        return <span className="flex w-max items-center text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-medium"><XCircle className="w-3 h-3 mr-1" /> Failed</span>
      case 'in_progress':
        return <span className="flex w-max items-center text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-medium"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> In Progress</span>
      case 'queued':
        return <span className="flex w-max items-center text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-medium"><Clock className="w-3 h-3 mr-1" /> Queued</span>
      default:
        return <span className="flex w-max items-center text-zinc-500 bg-zinc-500/10 px-2 py-1 rounded text-xs font-medium">{status}</span>
    }
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString()
  }

  const getDuration = (dep: any) => {
    if (dep.status === 'finished' || dep.status === 'failed' || dep.status === 'error') {
      const start = new Date(dep.created_at).getTime()
      const end = new Date(dep.updated_at).getTime()
      const diffStr = Math.max(0, Math.floor((end - start) / 1000))
      return `${diffStr}s`
    }
    return '-'
  }

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Despliegues</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Registros de todas las builds y despliegues de este entorno.</p>
        </div>
        <Button onClick={handleRedeploy} disabled={isDeploying || hasActiveDeployment} className="gap-2">
          {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
          Forzar Redespliegue
        </Button>
      </CardHeader>
      <CardContent>
        {deployments.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg bg-card/20 text-muted-foreground">
            No hay despliegues registrados para esta aplicación.
          </div>
        ) : (
          <div className="rounded-md border border-border/50 overflow-hidden bg-background/50">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium border-b border-border/50">
                <tr>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Commit / Origen</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {deployments.map((dep: any, idx: number) => (
                  <tr key={dep.uuid || dep.id || idx} className="hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => router.push(`/projects/${resource.id}/logs?deployment=${dep.uuid}`)}>
                    <td className="px-4 py-3">{getStatusBadge(dep.status)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground min-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="h-3 w-3 text-muted-foreground" />
                        {dep.commit ? dep.commit.substring(0, 7) : 'Manual'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatTime(dep.created_at)}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{getDuration(dep)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {/* 
        Memorización Antigravity: 
        Este componente usa render condicional basado en Active Deployments para activar el Webpolling de 3 segundos
        emulando React Query refetchInterval.
      */}
    </Card>
  )
}
