"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  FolderGit2, 
  PlusCircle, 
  Globe, 
  TerminalSquare, 
  KeyRound, 
  Database,
  CloudLightning,
  Activity,
  HardDrive
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const globalNavigation = [
  { name: 'Proyectos', href: '/projects', icon: FolderGit2 },
  { name: 'Dominios', href: '/domains', icon: Globe },
  { name: 'Bases de datos', href: '/databases', icon: Database },
]

export function Sidebar({ projects = [] }: { projects?: any[] }) {
  const pathname = usePathname()

  // Detect project specific context
  const projectIdMatch = pathname.match(/^\/projects\/([^/]+)/)
  const isProjectContext = projectIdMatch && projectIdMatch[1] !== 'new'
  const currentProjectId = isProjectContext ? projectIdMatch[1] : null

  // Project Context Navigation
  const projectComputeNav = [
    { name: 'General', href: `/projects/${currentProjectId}`, icon: Activity, exact: true },
    { name: 'Despliegues', href: `/projects/${currentProjectId}/deployments`, icon: FolderGit2 },
    { name: 'Logs', href: `/projects/${currentProjectId}/logs`, icon: TerminalSquare },
    { name: 'Variables de entorno', href: `/projects/${currentProjectId}/env`, icon: KeyRound },
  ]

  const projectDatabaseNav = [
    { name: 'Bases de datos', href: `/projects/${currentProjectId}/databases`, icon: Database },
  ]

  const projectStorageNav = [
    { name: 'Almacenamiento', href: `/projects/${currentProjectId}/storage`, icon: HardDrive },
  ]

  return (
    <div className="flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <CloudLightning className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            OLA <span className="text-primary font-light">CLOUD</span>
          </span>
        </Link>
      </div>
      
      <nav className="flex flex-1 flex-col p-4 overflow-y-auto">
        <Button asChild className="mb-6 w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20">
          <Link href="/projects/new">
            <PlusCircle className="h-4 w-4" /> Nueva App
          </Link>
        </Button>

        {isProjectContext ? (
          <div className="flex flex-col gap-y-6">
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider flex items-center gap-2">
                Compute <div className="h-px bg-border flex-1 ml-2"></div>
              </div>
              <ul role="list" className="flex flex-col gap-y-1">
                {projectComputeNav.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-all duration-200"
                        )}
                      >
                        <item.icon className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground", "h-4 w-4 shrink-0 transition-colors mt-1")} />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider flex items-center gap-2">
                Database <div className="h-px bg-border flex-1 ml-2"></div>
              </div>
              <ul role="list" className="flex flex-col gap-y-1">
                {projectDatabaseNav.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={cn(pathname.startsWith(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground", "group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-all duration-200")}>
                      <item.icon className={cn(pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground", "h-4 w-4 shrink-0 transition-colors mt-1")} />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider flex items-center gap-2">
                Storage <div className="h-px bg-border flex-1 ml-2"></div>
              </div>
              <ul role="list" className="flex flex-col gap-y-1">
                {projectStorageNav.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={cn(pathname.startsWith(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground", "group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-all duration-200")}>
                      <item.icon className={cn(pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground", "h-4 w-4 shrink-0 transition-colors mt-1")} />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {globalNavigation.map((item) => {
              const isActive = pathname === item.href || (pathname !== '/' && pathname?.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      "group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-all duration-200"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                        "h-5 w-5 shrink-0 transition-colors"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </div>
  )
}
/**
 * OLA CLOUD - Sidebar Component
 * Left navigation with blur effect and active state highlights using #00ffc8.
 */
