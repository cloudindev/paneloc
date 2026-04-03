"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  FolderGit2, 
  Globe, 
  TerminalSquare, 
  KeyRound, 
  Database,
  CloudLightning,
  Activity,
  HardDrive,
  CreditCard,
  BarChart2,
  Receipt
} from "lucide-react"
import { cn } from "@/lib/utils"
import OlaLogo from "@/components/OlaLogo"

export function Sidebar({ projects = [] }: { projects?: any[] }) {
  const pathname = usePathname()

  // Detect project specific context
  const projectIdMatch = pathname?.match(/^\/projects\/([^/]+)/)
  const isProjectContext = projectIdMatch && projectIdMatch[1] !== 'new'
  const currentProjectId = isProjectContext ? projectIdMatch[1] : null

  const mainNav = [
    { name: 'Projects', href: '/projects', icon: FolderGit2, exact: true },
    { name: 'Deployments', href: currentProjectId ? `/projects/${currentProjectId}/deployments` : `/deployments`, icon: CloudLightning },
    ...(currentProjectId ? [{ name: 'Environment Variables', href: `/projects/${currentProjectId}/env`, icon: KeyRound }] : []),
    { name: 'Logs', href: currentProjectId ? `/projects/${currentProjectId}/logs` : `/logs`, icon: TerminalSquare },
    { name: 'Observability', href: currentProjectId ? `/projects/${currentProjectId}/observability` : `/observability`, icon: Activity },
  ]

  const secondaryNav = [
    { name: 'Domains', href: currentProjectId ? `/projects/${currentProjectId}/domains` : `/domains`, icon: Globe },
    { name: 'Databases', href: currentProjectId ? `/projects/${currentProjectId}/databases` : `/databases`, icon: Database },
    { name: 'Storage', href: currentProjectId ? `/projects/${currentProjectId}/storage` : `/storage`, icon: HardDrive },
  ]

  const tertiaryNav = [
    { name: 'Usage', href: '/usage', icon: BarChart2 },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Invoice', href: '/invoice', icon: Receipt },
  ]

  const renderNavGroup = (items: any[]) => {
    return (
      <ul role="list" className="flex flex-col gap-y-1">
        {items.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname?.startsWith(item.href)
            
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-black/5 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground",
                  "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm leading-6 transition-all duration-200"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                    "h-[18px] w-[18px] shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="flex w-64 flex-col border-r border-[#EAEAEA] bg-[#FAFAFA]">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-[#EAEAEA]">
        <Link href="/">
          <OlaLogo className="w-[120px] h-[38px] xl:w-[130px] xl:h-[42px]" />
        </Link>
      </div>
      
      <nav className="flex flex-1 flex-col px-3 py-4 overflow-y-auto">
        <div className="flex flex-col">
          {renderNavGroup(mainNav)}
          
          <div className="h-px bg-[#EAEAEA] my-4 mx-2"></div>
          
          {renderNavGroup(secondaryNav)}
          
          <div className="h-px bg-[#EAEAEA] my-4 mx-2"></div>
          
          {renderNavGroup(tertiaryNav)}
        </div>
      </nav>
      
      {/* Documentation Header */}
      <div className="sr-only">
        {/* Antigravity Rule: Vercel-like simplified layout implemented. */}
      </div>
    </div>
  )
}
