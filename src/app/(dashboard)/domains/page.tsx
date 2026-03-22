"use client"

import * as React from "react"
import { Globe, Plus, ShieldCheck, ShieldAlert, Check } from "lucide-react"
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

const domains = [
  {
    id: "dom-1",
    name: "panel.olacloud.es",
    project: "ola-cloud-panel",
    type: "custom",
    ssl: "active",
    status: "verified",
  },
  {
    id: "dom-2",
    name: "*.store.com",
    project: "ecommerce-api",
    type: "wildcard",
    ssl: "active",
    status: "verified",
  },
  {
    id: "dom-3",
    name: "preview.landing.dev",
    project: "landing-marketing",
    type: "custom",
    ssl: "pending",
    status: "unverified",
  },
  {
    id: "dom-4",
    name: "worker.olacloud.internal",
    project: "background-worker",
    type: "internal",
    ssl: "active",
    status: "verified",
  }
]

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dominios</h1>
          <p className="text-muted-foreground mt-1">
            Mapeo de dominios personalizados y certificados SSL automáticos.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Añadir Dominio
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Buscar dominios..." 
          className="max-w-sm bg-card/50"
        />
      </div>

      <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Dominio</TableHead>
              <TableHead>Proyecto Asignado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado DNS</TableHead>
              <TableHead className="text-right">Certificado SSL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((domain) => (
              <TableRow key={domain.id} className="transition-colors hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-base">{domain.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{domain.project}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-muted-foreground">
                    {domain.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
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
                      <Badge variant="success" className="gap-1 bg-emerald-500/10 text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 border border-amber-500/30 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20">
                        <ShieldAlert className="h-3 w-3" />
                        Generando...
                      </Badge>
                    )}
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
 * OLA CLOUD - Domains Page
 * Clean table managing custom domains, mapped projects, and auto-SSL status visually.
 */
