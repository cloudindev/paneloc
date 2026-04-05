"use client"

import * as React from "react"
import { Globe, Plus, ShieldCheck, ShieldAlert, Check, Loader2, X, Trash2, AlertTriangle } from "lucide-react"
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
import { getAllDomains, addDomainToResource, removeDomainFromResource } from "@/app/actions/domains"
import { getProjectsFromDB } from "@/app/actions/projects"

export default function ProjectDomainsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: resourceId } = React.use(params)
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
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const [modalStep, setModalStep] = React.useState<1 | 2 | 3>(1)

  const fetchAll = async () => {
    setLoading(true)
    const [liveDomains, liveProjects] = await Promise.all([
      getAllDomains(),
      getProjectsFromDB()
    ])
    setDomains(liveDomains.filter((d: any) => d.resourceId === resourceId))
    setProjects(liveProjects.filter(p => p.status !== "error" && p.id === resourceId))
    setLoading(false)
  }

  React.useEffect(() => {
    fetchAll()
  }, [resourceId])

  const handleOpenModal = () => {
    setFormDomain("")
    setFormIncludeWww(true)
    setFormProjectId(resourceId)
    setModalStep(1)
    setIsModalOpen(true)
  }

  const handleSaveDomain = async () => {
    if (!formDomain.trim() || !formProjectId || formSaving) return
    setFormSaving(true)
    
    const res = await addDomainToResource(formProjectId, formDomain, formIncludeWww)
    
    if (res.success) {
      if (res.warning) {
        alert(res.warning) // Mostramos el warning de la limitación del API de Coolify
      }
      await fetchAll()
      setModalStep(2) // Pasamos al paso de instrucciones DNS
    } else {
      alert("Error enlazando dominio: " + res.error)
    }
    setFormSaving(false)
  }

  const [deleteModalDomain, setDeleteModalDomain] = React.useState<{resourceId: string, domainName: string} | null>(null)

  const confirmDeleteDomain = async () => {
    if (!deleteModalDomain) return
    setDeletingId(deleteModalDomain.domainName)
    const res = await removeDomainFromResource(deleteModalDomain.resourceId, deleteModalDomain.domainName)
    if (res.success) {
      await fetchAll()
    } else {
      alert("Error eliminando dominio: " + res.error)
    }
    setDeletingId(null)
    setDeleteModalDomain(null)
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
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Buscando configuraciones...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredDomains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      onClick={() => setDeleteModalDomain({resourceId: domain.resourceId, domainName: domain.name})}
                      disabled={deletingId === domain.name}
                    >
                      {deletingId === domain.name ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
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
              <h2 className="text-lg font-semibold tracking-tight">
                {modalStep === 1 ? "Vincular Nuevo Dominio" : "Configuración DNS Requerida"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {modalStep === 1 ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Dominio Personalizado</label>
                    <Input 
                      placeholder="ej. midominio.com" 
                      value={formDomain}
                      onChange={(e) => setFormDomain(e.target.value)}
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Coolify intentará provisionar un certificado SSL vía Let's Encrypt automáticamente.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 pb-6">
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
              </>
            ) : modalStep === 2 ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    ¡Dominio vinculado exitosamente!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Para que el tráfico llegue correctamente, debes configurar los siguientes registros en tu proveedor de dominio (GoDaddy, Cloudflare, Namecheap, etc).
                  </p>
                </div>

                <div className="bg-muted/40 rounded-lg border border-border/50 overflow-hidden text-left divide-y divide-border/50 font-mono text-sm">
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-muted-foreground">TIPO</span>
                    <span className="font-semibold text-cyan-500">A</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-muted-foreground">NOMBRE</span>
                    <span className="font-semibold">@ <span className="text-xs text-muted-foreground font-sans">(Raíz)</span></span>
                  </div>
                  <div className="p-3 flex flex-col gap-1 items-end">
                    <div className="flex justify-between w-full items-center">
                      <span className="text-muted-foreground">VALOR (IP)</span>
                      <span className="font-semibold text-foreground bg-background px-2 py-1 rounded border border-border">217.182.95.11</span>
                    </div>
                  </div>
                </div>

                {formIncludeWww && !formDomain.startsWith("www.") && (
                 <div className="bg-muted/40 rounded-lg border border-border/50 overflow-hidden text-left divide-y divide-border/50 font-mono text-sm mt-4">
                    <div className="p-3 flex justify-between items-center bg-card/50">
                      <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Alias WWW CNAME</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">TIPO</span>
                      <span className="font-semibold text-purple-400">CNAME</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">NOMBRE</span>
                      <span className="font-semibold text-foreground">www</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">DESTINO</span>
                      <span className="font-semibold text-foreground">{formDomain.replace(/^https?:\/\//, '')}</span>
                    </div>
                 </div>
                )}

                <Button onClick={() => setModalStep(3)} className="w-full mt-4 font-medium">
                  Entendido, ya lo he configurado
                </Button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    ¡Casi listo! Acción Requerida
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Para que los cambios de dominio surtan efecto internamente, debes ir a tu panel de Coolify y hacer clic en <strong>Restart</strong> o <strong>Redeploy</strong>. Si no lo haces, la web cargará como "No Available Server".
                  </p>
                </div>

                <Button onClick={() => setIsModalOpen(false)} className="w-full mt-4 font-medium bg-amber-600 hover:bg-amber-700 text-white">
                  Entendido, ¡voy a reiniciar ahora!
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteModalDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight mb-2">
              Desvincular Dominio
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              ¿Estás seguro de que quieres desvincular el dominio <strong>{deleteModalDomain.domainName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteModalDomain(null)} disabled={deletingId !== null}>
                Cancelar
              </Button>
              <Button onClick={confirmDeleteDomain} disabled={deletingId !== null} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {deletingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
