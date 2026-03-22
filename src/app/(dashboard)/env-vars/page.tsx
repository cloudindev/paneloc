"use client"

import * as React from "react"
import { Eye, EyeOff, Plus, Key, Lock, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const mockEnvVars = [
  { id: 1, key: "DATABASE_URL", scope: "production, staging", project: "Global", type: "secret" },
  { id: 2, key: "NEXT_PUBLIC_API_URL", scope: "production", project: "ola-cloud-panel", type: "plain" },
  { id: 3, key: "STRIPE_SECRET_KEY", scope: "production", project: "ecommerce-api", type: "secret" },
  { id: 4, key: "AWS_ACCESS_KEY_ID", scope: "global", project: "Global", type: "secret" },
]

export default function EnvVarsPage() {
  const [showValues, setShowValues] = React.useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Variables de Entorno</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona de forma segura los secretos y configuraciones de tus proyectos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="shrink-0 gap-2"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showValues ? "Ocultar Valores" : "Mostrar Valores"}
          </Button>
          <Button className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            Añadir Variable
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Buscar por KEY o Proyecto..." 
          className="max-w-md bg-card/50"
        />
      </div>

      <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Key</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Entornos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEnvVars.map((envVar) => (
              <TableRow key={envVar.id}>
                <TableCell className="font-medium font-mono">
                  <div className="flex items-center gap-2">
                    {envVar.type === 'secret' ? (
                      <Lock className="h-3 w-3 text-primary" />
                    ) : (
                      <Key className="h-3 w-3 text-muted-foreground" />
                    )}
                    {envVar.key}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {showValues ? (
                    envVar.type === 'secret' ? "s€cr3t_v4lu3_m0ck3d_123" : "https://api.example.com"
                  ) : (
                    "••••••••••••••••"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={envVar.project === 'Global' ? 'outline' : 'secondary'} className="rounded-sm">
                    {envVar.project}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground capitalize">{envVar.scope}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-8 flex gap-4 items-start">
        <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-primary">Encriptación End-to-End</h4>
          <p className="text-sm text-muted-foreground mt-1 text-balance">
            Las variables de entorno marcadas como secreto se encriptan al instante y nunca se muestran en texto plano en los logs ni en la consola sin autorización explícita.
          </p>
        </div>
      </div>
    </div>
  )
}
/**
 * OLA CLOUD - EnvVars Page
 * Management table for environment variables and secrets with mock toggle visibility.
 */
