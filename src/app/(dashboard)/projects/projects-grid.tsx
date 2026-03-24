"use client"

import * as React from "react"
import { Search, Globe2, Server, TerminalSquare, RotateCcw, Play, Square, MoreVertical, GitBranch } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { getLiveProjectStatus } from "@/app/actions/coolify"

function ActionMenu({ project }: { project: any }) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuRef])

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(!open)}>
        <MoreVertical className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-10 w-48 rounded-md bg-popover border border-border shadow-md z-50 p-1 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
          <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
            <RotateCcw className="h-4 w-4 mr-2" /> Reiniciar (WIP)
          </button>
          <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent text-red-400 hover:text-red-500 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
            <Square className="h-4 w-4 mr-2" /> Detener (WIP)
          </button>
        </div>
      )}
    </div>
  )
}

import Link from "next/link"

export function ProjectsGrid({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = React.useState(initialProjects)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    // Polling background silencioso para inyectar status vital del contenedor VM100
    const fetchStatuses = async () => {
      const updated = await Promise.all(
        projects.map(async (p) => {
          if (!p.config?.coolify_uuid) return p
          const live = await getLiveProjectStatus(p.config.coolify_uuid)
          if (live.success) {
            return {
              ...p,
              liveStatus: live.status,
              domain: live.fqdn || p.config.domain,
              lastDeploy: live.updated_at
            }
          }
          return p
        })
      )
      setProjects(updated)
    }

    fetchStatuses()
    const interval = setInterval(fetchStatuses, 10000) // 10s heartbeat
    return () => clearInterval(interval)
  }, []) // Se invoca solo al montar el dashboard

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar aplicaciones o repositorios..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/50 backdrop-blur-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => {
          const status = (project.liveStatus || project.status).toLowerCase()
          
          // Estilizado dinámico de anillos de estado Cloud
          let ringColor = "bg-muted"
          let textColor = "text-muted-foreground"
          
          if (status.includes("running")) { 
            ringColor = "bg-emerald-500"
            textColor = "text-emerald-500" 
          }
          else if (status.includes("building") || status.includes("deploying") || status.includes("starting")) { 
            ringColor = "bg-yellow-500 animate-pulse"
            textColor = "text-yellow-500" 
          }
          else if (status.includes("exited") || status.includes("stopped")) { 
            ringColor = "bg-zinc-500"
            textColor = "text-zinc-500" 
          }
          else if (status.includes("error") || status.includes("failed")) { 
            ringColor = "bg-red-500"
            textColor = "text-red-500" 
          }

          return (
            <Card key={project.id} className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border border-border/50 hover:border-border transition-all">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {project.config?.framework === 'nextjs' ? (
                        <Globe2 className="h-5 w-5 text-primary" />
                      ) : project.config?.framework === 'nodejs' ? (
                        <Server className="h-5 w-5 text-primary" />
                      ) : (
                        <TerminalSquare className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">{project.config?.repo || "Desconocido"}</p>
                    </div>
                  </div>
                  <ActionMenu project={project} />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {status.includes("running") && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ringColor}`}></span>
                    </span>
                    <span className={`capitalize font-medium ${textColor}`}>{status || "pending"}</span>
                  </div>
                  {project.domain ? (
                    <a href={project.domain.startsWith('http') ? project.domain : `http://${project.domain}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:underline truncate max-w-[150px]">
                      {project.domain.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Generando dominio...</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50 text-xs text-muted-foreground justify-between">
                <span className="flex items-center gap-1.5"><GitBranch className="h-3 w-3" /> {project.config?.branch || "main"}</span>
                <span>{project.lastDeploy ? new Date(project.lastDeploy).toLocaleString() : "Sin despliegues"}</span>
              </CardFooter>
            </Card>
          )
        })}
        {filtered.length === 0 && (
           <div className="col-span-full py-12 text-center border rounded-xl bg-card/20 border-dashed">
            <h3 className="text-lg font-medium text-foreground mb-1">No hay proyectos</h3>
            <p className="text-sm text-muted-foreground mb-4">Empieza desplegando tu primera aplicación desde GitHub o usa otra palabra clave de búsqueda.</p>
           </div>
        )}
      </div>
    </div>
  )
}
/**
 * Recordatorio de Memoria (Antigravity):
 * Utilizamos Grid en vez de Tablas clásicas para aprovechar la asimetría de componentes.
 * Se han inyectado _polled loops_ porque la API v4 de Coolify no es socket stream aún.
 * Si el usuario reporta parpadeos de grid, meter useMemo.
 */
