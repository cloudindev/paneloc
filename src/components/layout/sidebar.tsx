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
  CloudLightning
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Proyectos', href: '/projects', icon: FolderGit2 },
  { name: 'Nueva app', href: '/projects/new', icon: PlusCircle },
  { name: 'Dominios', href: '/domains', icon: Globe },
  { name: 'Logs básicos', href: '/logs', icon: TerminalSquare },
  { name: 'Variables de entorno', href: '/env-vars', icon: KeyRound },
  { name: 'Bases de datos', href: '/databases', icon: Database },
]

export function Sidebar() {
  const pathname = usePathname()

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
      <nav className="flex flex-1 flex-col p-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/')
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
      </nav>
    </div>
  )
}
/**
 * OLA CLOUD - Sidebar Component
 * Left navigation with blur effect and active state highlights using #00ffc8.
 */
