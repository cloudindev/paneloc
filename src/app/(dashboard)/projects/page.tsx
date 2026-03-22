"use client"

import * as React from "react"
import Link from "next/link"
import { PlusCircle, Search, Server, Globe2, Clock, GitBranch, TerminalSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const projects = [
  {
    id: "proj-1",
    name: "ola-cloud-panel",
    framework: "Next.js",
    env: "production",
    status: "active",
    domain: "panel.olacloud.es",
    lastDeploy: "hace 5 mins"
  },
  {
    id: "proj-2",
    name: "ecommerce-api",
    framework: "Node.js",
    env: "production",
    status: "active",
    domain: "api.store.com",
    lastDeploy: "hace 2 horas"
  },
  {
    id: "proj-3",
    name: "landing-marketing",
    framework: "Next.js",
    env: "staging",
    status: "stopped",
    domain: "preview.landing.dev",
    lastDeploy: "hace 3 días"
  },
  {
    id: "proj-4",
    name: "background-worker",
    framework: "Python",
    env: "production",
    status: "active",
    domain: "N/A",
    lastDeploy: "hace 1 mes"
  }
]

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus aplicaciones web y servicios backend.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/projects/new">
            <PlusCircle className="h-4 w-4" />
            Nueva App
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar proyectos..." 
            className="pl-9 bg-card/50"
          />
        </div>
        <Button variant="outline">Filtros</Button>
      </div>

      <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Proyecto</TableHead>
              <TableHead>Entorno</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Dominio Principal</TableHead>
              <TableHead className="text-right">Último Despliegue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} className="cursor-pointer transition-colors hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {project.framework === 'Next.js' ? (
                        <Globe2 className="h-5 w-5 text-primary" />
                      ) : project.framework === 'Node.js' ? (
                        <Server className="h-5 w-5 text-primary" />
                      ) : (
                        <TerminalSquare className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{project.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{project.framework}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GitBranch className="h-3 w-3" />
                    <span className="capitalize">{project.env}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={project.status === 'active' ? 'success' : 'secondary'}
                  >
                    {project.status === 'active' ? 'Activo' : 'Detenido'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">{project.domain}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {project.lastDeploy}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
/**
 * OLA CLOUD - Projects List Component
 * Clean table visualizing apps with domain info, status badge, and custom icons.
 */
