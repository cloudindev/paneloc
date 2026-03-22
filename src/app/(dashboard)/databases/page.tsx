"use client"

import * as React from "react"
import { Database, Plus, Play, RotateCw, ExternalLink, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const mockDatabases = [
  {
    id: "db-1",
    name: "main-production-db",
    type: "PostgreSQL 16",
    status: "active",
    region: "eu-west-1",
    size: "12.4 GB / 50 GB",
    connections: 45,
    cpu: "12%"
  },
  {
    id: "db-2",
    name: "staging-db",
    type: "PostgreSQL 16",
    status: "active",
    region: "eu-west-1",
    size: "2.1 GB / 10 GB",
    connections: 5,
    cpu: "2%"
  },
  {
    id: "db-3",
    name: "analytics-warehouse",
    type: "ClickHouse",
    status: "provisioning",
    region: "us-east-1",
    size: "0 GB / 500 GB",
    connections: 0,
    cpu: "0%"
  }
]

export default function DatabasesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bases de Datos</h1>
          <p className="text-muted-foreground mt-1">
            Instancias de bases de datos gestionadas, backups automáticos y alta disponibilidad.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Crear Cluster DB
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Buscar bases de datos..." 
          className="max-w-sm bg-card/50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockDatabases.map((db) => (
          <Card key={db.id} className="bg-card/40 backdrop-blur-sm transition-all hover:bg-card/60 hover:border-primary/50 group flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="overflow-hidden">
                <div className="font-semibold truncate text-lg" title={db.name}>
                  {db.name}
                </div>
                <div className="text-sm text-muted-foreground font-normal mt-1 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  {db.type}
                </div>
              </CardTitle>
              <Badge variant={db.status === 'active' ? 'success' : 'secondary'} className="ml-2 uppercase text-[10px]">
                {db.status === 'active' ? 'Running' : 'Creating...'}
              </Badge>
            </CardHeader>
            <CardContent className="mt-4 flex-1">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Región</span>
                  <span className="font-medium uppercase">{db.region}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Almacenamiento</span>
                  <span className="font-medium flex items-center gap-1.5 text-xs">
                    <HardDrive className="h-3 w-3" />
                    {db.size}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conexiones Activas</span>
                  <span className="font-medium">{db.connections}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Uso de CPU</span>
                  <span className="font-medium text-primary">{db.cpu}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/50 bg-background/20 gap-2">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" disabled={db.status !== 'active'}>
                <ExternalLink className="h-3 w-3" />
                Conectar
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" disabled={db.status !== 'active'}>
                <RotateCw className="h-3 w-3" />
                Reiniciar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
/**
 * OLA CLOUD - Databases Page
 * Beautiful grid visualizing managed database clusters with their metrics.
 */
