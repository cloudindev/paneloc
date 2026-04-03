"use client"

import * as React from "react"
import { HardDrive, Search, Plus, Filter, MoreVertical, Server, ArrowUpRight, Folder, File, ImageIcon, PlaySquare, FileText, Database, ShieldAlert, CheckCircle2, Eye, Lock } from "lucide-react"
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

export default function StoragePremiumDemo() {
  const [activeTab, setActiveTab] = React.useState("buckets")

  // Dummies
  const buckets = [
    { name: "olacloud-assets-prod", region: "eu-west-3", size: "235.4 GB", objects: "1.4M", status: "Active", access: "Public Read" },
    { name: "noticrm-avatars", region: "eu-west-3", size: "12.1 GB", objects: "42K", status: "Active", access: "Public Read" },
    { name: "db-backups-vault", region: "eu-west-3", size: "854.2 GB", objects: "1,200", status: "Locked", access: "Private" },
  ]

  const recentFiles = [
    { name: "hero-bg-v4.webp", type: "image", size: "4.2 MB", bucket: "olacloud-assets-prod", time: "Hace 2 minutos" },
    { name: "2026-03-27-pg-dump.sql.gz", type: "archive", size: "1.2 GB", bucket: "db-backups-vault", time: "Hace 4 horas" },
    { name: "avatar_uuid_x8f.png", type: "image", size: "840 KB", bucket: "noticrm-avatars", time: "Ayer" },
    { name: "onboarding-video.mp4", type: "video", size: "142 MB", bucket: "olacloud-assets-prod", time: "Ayer" },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="w-4 h-4 text-pink-400" />
      case "archive": return <Database className="w-4 h-4 text-primary" />
      case "video": return <PlaySquare className="w-4 h-4 text-orange-400" />
      default: return <FileText className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Object Storage</h1>
          <p className="text-muted-foreground mt-1">
            Almacenamiento compatible con S3 de alto rendimiento para tus aplicaciones.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="shrink-0 gap-2 font-medium">
            <Plus className="h-4 w-4" />
            Crear Bucket
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-sm p-6 group cursor-pointer hover:border-primary/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Sano</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">1.1 TB</h3>
            <p className="text-sm text-muted-foreground">Almacenamiento Total</p>
          </div>
          <div className="mt-4 h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[45%]" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">45% de cuota utilizada</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-sm p-6 group cursor-pointer hover:border-primary/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">8.4 TB</h3>
            <p className="text-sm text-muted-foreground">Transferencia de Salida (Egress)</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-emerald-500 font-medium">+12%</span> respecto al mes pasado
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-sm p-6 group cursor-pointer hover:border-primary/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full">1.4M Objetos</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">3</h3>
            <p className="text-sm text-muted-foreground">Buckets Activos</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab("buckets")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "buckets" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Buckets
        </button>
        <button 
          onClick={() => setActiveTab("browser")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "browser" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Explorador S3
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Credenciales API
        </button>
      </div>

      {activeTab === "buckets" && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Buscar bucket..." 
              className="max-w-xs bg-card/50"
            />
          </div>
          <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Región</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Objetos</TableHead>
                  <TableHead>Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/50">
                {buckets.map((bucket) => (
                  <TableRow key={bucket.name} className="hover:bg-muted/30 transition-colors cursor-pointer group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-primary" />
                        {bucket.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{bucket.region}</TableCell>
                    <TableCell className="font-mono text-xs">{bucket.size}</TableCell>
                    <TableCell className="font-mono text-xs">{bucket.objects}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full border flex items-center w-fit gap-1.5
                        ${bucket.access === 'Public Read' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}
                      >
                        {bucket.access === 'Public Read' ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {bucket.access}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "browser" && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex gap-4">
            {/* Sidebar with buckets */}
            <div className="w-64 shrink-0 rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 h-[500px]">
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground tracking-wider uppercase">Buckets</h3>
              <div className="space-y-1">
                {buckets.map((b) => (
                  <div key={b.name} className={`px-3 py-2 rounded-md text-sm cursor-pointer flex items-center justify-between group ${b.name === "olacloud-assets-prod" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>
                    <div className="flex items-center gap-2 truncate">
                      <HardDrive className={`w-4 h-4 shrink-0 ${b.name === "olacloud-assets-prod" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="truncate">{b.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File explorer main area */}
            <div className="flex-1 rounded-xl border border-border bg-card/40 backdrop-blur-sm flex flex-col h-[500px] overflow-hidden">
              <div className="p-3 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-foreground/80 font-mono">
                  <span className="text-primary hover:underline cursor-pointer">olacloud-assets-prod</span>
                  <span className="text-muted-foreground">/</span>
                  <span>images</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">v4</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8">Subir Archivo</Button>
                  <Button variant="outline" size="sm" className="h-8">Nueva Carpeta</Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card/90 backdrop-blur z-10">
                    <TableRow className="border-border/50">
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead>Modificado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-muted/30 cursor-pointer">
                      <TableCell className="font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-primary" /> ..
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    {recentFiles.filter(f => f.bucket === "olacloud-assets-prod").map((file, i) => (
                      <TableRow key={i} className="hover:bg-muted/30 cursor-pointer">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(file.type)}
                            {file.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{file.size}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{file.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="max-w-2xl animate-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Credenciales del Endopoint S3</h3>
              <p className="text-sm text-muted-foreground">Estas claves otorgan acceso administrativo al Storage. ¡No las publiques en repositorios!</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">S3 Endpoint URL</label>
                <div className="flex gap-2">
                  <Input value="https://s3.eu-west.olacloud.es" readOnly className="font-mono bg-black/40 text-primary" />
                  <Button variant="outline" size="icon" className="shrink-0"><FileText className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Access Key ID</label>
                <div className="flex gap-2">
                  <Input value="OLA_XXXXXXXXXXXXXXXXXXXX" readOnly className="font-mono bg-black/40 text-muted-foreground" />
                  <Button variant="outline" size="icon" className="shrink-0"><FileText className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Secret Access Key</label>
                <div className="flex gap-2">
                  <Input value="••••••••••••••••••••••••••••••••••••••••" type="password" readOnly className="font-mono bg-black/40" />
                  <Button variant="outline" className="shrink-0">Revelar Secret</Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex gap-3 items-start mt-6">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-500 text-sm">Rotación de Claves API</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Si crees que tus claves han sido comprometidas, debes invalidarlas inmediatamente. Se interrumpirá el acceso a las aplicaciones que las estén usando.
                </p>
                <Button variant="destructive" size="sm" className="mt-3 text-xs w-auto">Rotar Credenciales</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
