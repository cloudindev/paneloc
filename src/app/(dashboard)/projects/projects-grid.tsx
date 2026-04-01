"use client"

import * as React from "react"
import { deleteProjectAction } from "@/app/actions/projects"
import { Search, Globe2, Server, TerminalSquare, RotateCcw, Play, Square, MoreVertical, GitBranch, Trash2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { getLiveProjectStatus } from "@/app/actions/coolify"

function ActionMenu({ project, onDelete }: { project: any, onDelete: (id: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [isDeleting, startDeleting] = React.useTransition()
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
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

  const handleDeleteClick = () => {
    setOpen(false)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    startDeleting(async () => {
      const res = await deleteProjectAction(project.id)
      if (res.success) {
        onDelete(project.id)
      } else {
        alert(`Error al eliminar: ${res.error}`)
      }
      setShowDeleteModal(false)
    })
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => setOpen(!open)} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <MoreVertical className="h-4 w-4" />}
        </Button>
        {open && (
          <div className="absolute right-0 top-10 w-48 rounded-md bg-popover border border-border shadow-md z-50 p-1 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
            <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <RotateCcw className="h-4 w-4 mr-2" /> Reiniciar (WIP)
            </button>
            <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent text-red-400 hover:text-red-500 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <Square className="h-4 w-4 mr-2" /> Detener (WIP)
            </button>
            <div className="h-px bg-border my-1"></div>
            <button onClick={handleDeleteClick} className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar Proyecto
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-destructive/20 bg-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Precaución Crítica</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Acción irreversible en Producción</p>
                </div>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed pt-2">
                Estás a punto de eliminar permanentemente el proyecto <span className="font-semibold text-primary">{project.name}</span>. 
                Esto destruirá su contenedor virtual en Coolify y eliminará todo el código compilado sin posibilidad de recuperación.
              </p>
              <div className="flex bg-destructive/5 text-destructive border border-destructive/10 p-3 rounded-xl mt-4">
                 <p className="text-[13px] font-medium leading-tight">Esta acción no elimina tu código fuente original en GitHub, pero interrumpe el acceso público a tu aplicación de inmediato.</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 border-t border-border/50 bg-muted/30 px-6 py-4">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="rounded-xl hover:bg-foreground/5">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting} className="rounded-xl shadow-lg shadow-destructive/20 px-6">
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Destruyendo...
                  </span>
                ) : (
                  "Destruir Proyecto"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import Link from "next/link"
import { useRouter } from "next/navigation"

export function ProjectsGrid({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = React.useState(initialProjects)
  const [search, setSearch] = React.useState("")
  const router = useRouter()

  const projectsRef = React.useRef(projects)
  React.useEffect(() => {
    projectsRef.current = projects
  }, [projects])

  React.useEffect(() => {
    // Polling background silencioso para inyectar status vital del contenedor VM100
    const fetchStatuses = async () => {
      const currentProjects = projectsRef.current
      const updated = await Promise.all(
        currentProjects.map(async (p) => {
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
          let rawStatus = (project.liveStatus || project.status).toLowerCase()
          
          // Si el estado es exited pero el proyecto se creó hace menos de 4 minutos, 
          // probablemente el primer despliegue base (Nixpacks) siga corriendo en Coolify.
          const isRecentlyCreated = new Date().getTime() - new Date(project.createdAt).getTime() < 4 * 60 * 1000
          if (rawStatus.includes("exited") && isRecentlyCreated) {
            rawStatus = "in progress"
          }

          const status = rawStatus.split(":")[0] // clean "running:unknown" or "exited:expected"
          
          // Estilizado dinámico de anillos de estado Cloud
          let ringColor = "bg-muted"
          let textColor = "text-muted-foreground"
          
          if (rawStatus.includes("running")) { 
            ringColor = "bg-emerald-500"
            textColor = "text-emerald-500" 
          }
          else if (rawStatus.includes("building") || rawStatus.includes("deploying") || rawStatus.includes("starting") || rawStatus.includes("in progress")) { 
            ringColor = "bg-yellow-500 animate-pulse"
            textColor = "text-yellow-500" 
          }
          else if (rawStatus.includes("exited") || rawStatus.includes("stopped")) { 
            ringColor = "bg-zinc-500"
            textColor = "text-zinc-500" 
          }
          else if (rawStatus.includes("error") || rawStatus.includes("failed")) { 
            ringColor = "bg-red-500"
            textColor = "text-red-500" 
          }

          const isRunning = rawStatus.includes("running")

          return (
            <Card key={project.id} className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border border-border/50 hover:border-border transition-all hover:shadow-sm">
              <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0" aria-label={`Ver detalle de ${project.name}`} />
              
              <CardHeader className="pb-4 relative z-10 pointer-events-none">
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
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{project.config?.repo || "Desconocido"}</p>
                    </div>
                  </div>
                  <div className="pointer-events-auto">
                    <ActionMenu project={project} onDelete={(id) => {
                      setProjects(prev => prev.filter(p => p.id !== id))
                      router.refresh()
                    }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 relative z-10 pointer-events-none">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ringColor}`}></span>
                    </span>
                    <span className={`capitalize font-medium ${textColor}`}>{status || "pending"}</span>
                  </div>
                  {project.domain && isRunning ? (
                    <a href={project.domain.startsWith('http') ? project.domain : `http://${project.domain}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:underline truncate max-w-[150px] relative z-20 pointer-events-auto">
                      {project.domain.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">{!isRunning && project.domain ? "Esperando compilación..." : "Asignando dominio..."}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50 text-xs text-muted-foreground justify-between relative z-10 pointer-events-none">
                <span className="flex items-center gap-1.5"><GitBranch className="h-3 w-3" /> {project.config?.branch || "main"}</span>
                <span>{project.lastDeploy ? new Date(project.lastDeploy).toLocaleString() : "Sin despliegues"}</span>
              </CardFooter>
            </Card>
          )
        })}
        {projects.length === 0 ? (
           <div className="col-span-full py-20 text-center border rounded-xl bg-card/20 border-dashed flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 mb-4">
              <Globe2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">Aún no tienes ningún proyecto</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Despliega tu primera aplicación en OLA CLOUD en pocos segundos en formato Docker, Node o Next.js
            </p>
            <Button asChild>
              <Link href="/projects/new">Crear mi primer Proyecto</Link>
            </Button>
           </div>
        ) : filtered.length === 0 ? (
           <div className="col-span-full py-12 text-center border rounded-xl bg-card/20 border-dashed border-muted">
            <h3 className="text-lg font-medium text-foreground mb-1">No hay resultados</h3>
            <p className="text-sm text-muted-foreground">No se ha encontrado ninguna aplicación que coincida con tu búsqueda.</p>
           </div>
        ) : null}
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
