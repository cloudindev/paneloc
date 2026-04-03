"use client"

import * as React from "react"
import { Search, Plus, Globe, AppWindow } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ProjectSelectorProps {
  title: string
  targetPath: string
  projects: any[]
}

export function ProjectSelector({ title, targetPath, projects }: ProjectSelectorProps) {
  const [search, setSearch] = React.useState("")

  const filtered = projects.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.project?.name && p.project.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
        <p className="text-muted-foreground">Choose a project to continue</p>
      </div>

      <div className="w-full max-w-lg bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="p-2 border-b border-border/50 bg-muted/20">
          <div className="relative">
            <Input 
              autoFocus
              placeholder="Find Project..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-12 text-base placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((proj) => (
              <Link 
                key={proj.id} 
                href={`/projects/${proj.id}/${targetPath}`}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                  {proj.type === "WEB_SERVICE" ? <Globe className="w-4 h-4" /> : <AppWindow className="w-4 h-4" />}
                </div>
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="font-medium text-foreground truncate">{proj.name}</span>
                  {proj.project?.name && proj.project.name !== proj.name && (
                    <span className="text-xs text-muted-foreground truncate">{proj.project.name}</span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No projects found.
            </div>
          )}
        </div>

        <div className="p-2 border-t border-border/50 bg-muted/10">
          <Link 
            href="/projects/new"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <Plus className="w-5 h-5 line-clamp-1" />
            <span className="font-medium">Create Project</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
