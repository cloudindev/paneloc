"use client"

import * as React from "react"
import { Globe, Plus, ShieldCheck, ShieldAlert, Check, Loader2 } from "lucide-react"
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
import { getAllDomains } from "@/app/actions/domains"

export default function DomainsPage() {
  const [domains, setDomains] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    async function fetchDomains() {
      const liveDomains = await getAllDomains()
      setDomains(liveDomains)
      setLoading(false)
    }
    fetchDomains()
  }, [])

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
        <Button className="shrink-0 gap-2 font-medium">
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
    </div>
  )
} // Documented: Migrated placeholder arrays to synchronized Prisma fetch pipelines.
