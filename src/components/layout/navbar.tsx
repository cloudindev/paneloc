"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, LogOut, ChevronDown, Check, FolderGit2, Globe2, Server as ServerIcon, TerminalSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"

export function Navbar({ projects = [], organization = "Personal" }: { projects?: any[], organization?: string }) {
  const pathname = usePathname()
  const [openSwitcher, setOpenSwitcher] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const switcherRef = React.useRef<HTMLDivElement>(null)

  // Determine valid active project from URL if inside a project
  const projectIdMatch = pathname.match(/^\/projects\/([^/]+)/)
  const currentProjectId = projectIdMatch && projectIdMatch[1] !== 'new' ? projectIdMatch[1] : null
  const currentProject = currentProjectId ? projects.find(p => p.id === currentProjectId) : null
  const resourceParams = currentProject

  // Click outside listener
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) setOpenSwitcher(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Flattened resources for switcher
  const filteredResources = projects.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* LEFT: Contextual Breadcrumb & Switcher */}
      <div className="flex items-center gap-2">
        {/* Organization Name */}
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
            {organization.charAt(0).toUpperCase()}
          </div>
          <span>{organization}</span>
        </div>

        <span className="text-muted-foreground/50">/</span>

        {/* Project Switcher */}
        <div className="relative" ref={switcherRef}>
          <button 
            onClick={() => setOpenSwitcher(!openSwitcher)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors"
          >
            {resourceParams ? (
              <span className="flex items-center gap-2">
                {resourceParams.config?.framework === 'nextjs' ? <Globe2 className="h-4 w-4 text-primary" /> : <ServerIcon className="h-4 w-4 text-primary" />}
                {resourceParams.name}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground"><FolderGit2 className="h-4 w-4" /> Todos los Proyectos</span>
            )}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openSwitcher ? 'rotate-180' : ''}`} />
          </button>

          {/* Switcher Dropdown */}
          {openSwitcher && (
            <div className="absolute top-12 left-0 w-72 rounded-xl bg-card border border-border/50 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-2 border-b border-border/50">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar proyecto..." 
                    className="h-9 pl-8 bg-muted/50 border-transparent focus-visible:bg-background"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-1 py-1.5">
                {filteredResources.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">No se encontraron proyectos.</div>
                ) : (
                  filteredResources.map((res: any) => (
                    <Link 
                      key={res.id} 
                      href={`/projects/${res.id}`}
                      onClick={() => setOpenSwitcher(false)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors ${res.id === currentProjectId ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}
                    >
                      <div className="flex items-center gap-2">
                        {res.config?.framework === 'nextjs' ? <Globe2 className="h-4 w-4" /> : <ServerIcon className="h-4 w-4" />}
                        <span className="truncate max-w-[180px]">{res.name}</span>
                      </div>
                      {res.id === currentProjectId && <Check className="h-4 w-4" />}
                    </Link>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-border/50 bg-muted/20">
                <Link 
                  href="/projects/new" 
                  onClick={() => setOpenSwitcher(false)}
                  className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Search className="h-3 w-3" /> Ver todos los proyectos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: User Actions */}
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <span className="sr-only">Ver notificaciones</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

        <div className="relative group">
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" className="flex items-center gap-x-3 p-1 hover:bg-destructive/10 hover:text-destructive group-hover:text-destructive transition-all">
              <span className="sr-only">Cerrar sesión</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-destructive/20 group-hover:text-destructive transition-all">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold leading-6" aria-hidden="true">
                  Cerrar sesión
                </span>
              </span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
/**
 * OLA CLOUD - Contextual Navbar Component
 * Replaces generic search with a Vercel-like Project Switcher Dropdown.
 */
