"use client"

import * as React from "react"
import { Globe, Plus, ShieldCheck, ShieldAlert, Check, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAllDomains, addDomainToResource } from "@/app/actions/domains"
import { getProjectsFromDB } from "@/app/actions/projects"

export default function DomainsPage() {
  const [domains, setDomains] = React.useState<any[]>([])
  const [projects, setProjects] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [formDomain, setFormDomain] = React.useState("")
  const [formIncludeWww, setFormIncludeWww] = React.useState(true)
  const [formProjectId, setFormProjectId] = React.useState("")
  const [formSaving, setFormSaving] = React.useState(false)

  const fetchAll = async () => {
    setLoading(true)
    const [liveDomains, liveProjects] = await Promise.all([
      getAllDomains(),
      getProjectsFromDB()
    ])
    setDomains(liveDomains)
    setProjects(liveProjects.filter(p => p.status !== "error"))
    setLoading(false)
  }

  React.useEffect(() => {
    fetchAll()
  }, [])

  const handleOpenModal = () => {
    setFormDomain("")
    setFormIncludeWww(true)
    setFormProjectId("")
    setIsModalOpen(true)
  }

  const handleSaveDomain = async () => {
    if (!formDomain.trim() || !formProjectId || formSaving) return
    setFormSaving(true)
    
    const res = await addDomainToResource(formProjectId, formDomain, formIncludeWww)
    
    if (res.success) {
      setIsModalOpen(false)
      await fetchAll()
    } else {
      alert("Error enlazando dominio: " + res.error)
    }
    setFormSaving(false)
  }

  const filteredDomains = domains.filter((d: any) => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.project.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dominios</h1>
          <p className="text-muted-foreground mt-1">
            Mapeo de dominios personalizados y certificados SSL automáticos.
          </p>
        </div>
        <Button onClick={handleOpenModal} className="shrink-0 gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Añadir Dominio
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Buscar dominios..." 
          className="max-w-sm bg-card/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/50 border-b-border/50">
              <TableHead className="w-[300px]">Dominio</TableHead>
              <TableHead>Proyecto Asignado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado DNS</TableHead>
              <TableHead className="text-right">Certificado SSL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Buscando configuraciones...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredDomains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No se han encontrado dominios. Despliega una aplicación primero.
                </TableCell>
              </TableRow>
            ) : (
              filteredDomains.map((domain) => (
                <TableRow key={domain.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/40 border border-border/50 shadow-sm">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-base font-mono tracking-tight">{domain.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground font-medium">{domain.project}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-muted-foreground font-medium">
                      {domain.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {domain.status === "verified" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-dashed border-amber-500 animate-spin" />
                      )}
                      <span className={domain.status === "verified" ? "text-emerald-500" : "text-amber-500"}>
                        {domain.status === "verified" ? "Configurado" : "Pendiente"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {domain.ssl === "active" ? (
                        <Badge variant="success" className="gap-1.5 font-semibold text-[11px] uppercase tracking-wider">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1.5 border border-amber-500/30 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 font-semibold text-[11px] uppercase tracking-wider">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Generando...
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight">Vincular Nuevo Dominio</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Dominio Personalizado</label>
                <Input 
                  placeholder="ej. web.midominio.com" 
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Coolify intentará provisionar un certificado SSL vía Let's Encrypt automáticamente.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="includeWww"
                  checked={formIncludeWww}
                  onChange={(e) => setFormIncludeWww(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="includeWww" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Añadir alias www. (Redirección Automática)
                </label>
              </div>

              <div className="space-y-2 pb-2">
                <label className="text-sm font-medium text-foreground">Proyecto de Destino</label>
                <select 
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                >
                  <option value="" className="bg-background text-muted-foreground">Seleccionar Aplicación...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-background text-foreground">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={formSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveDomain} disabled={!formDomain.trim() || !formProjectId || formSaving}>
                {formSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formSaving ? 'Vinculando...' : 'Añadir al Proyecto'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} // Documented: Migrated placeholder arrays to synchronized Prisma fetch pipelines.
