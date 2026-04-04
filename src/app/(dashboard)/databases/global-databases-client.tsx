"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, TerminalSquare, Search, Plus, ExternalLink, Trash2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { deleteDatabaseFromCoolify } from "@/app/actions/coolify"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function GlobalDatabasesView({ databases }: { databases: any[] }) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [deleteModalDb, setDeleteModalDb] = React.useState<{id: string, name: string, coolifyUuid: string} | null>(null)
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false)

  const confirmDeleteDb = async () => {
    if (!deleteModalDb) return
    setIsDeleting(true)
    
    try {
      const res = await deleteDatabaseFromCoolify(deleteModalDb.id, deleteModalDb.coolifyUuid)
      if (res.success) {
        toast.success("Base de datos eliminada.")
        setDeleteModalDb(null)
        router.refresh()
      } else {
        toast.error(`Error: ${res.error}`)
      }
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar")
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = databases.filter(db => 
    db.name.toLowerCase().includes(search.toLowerCase()) || 
    (db.project?.name || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Databases</h1>
          <p className="text-muted-foreground mt-1">Visión global de todas las bases de datos en tus proyectos.</p>
        </div>
        <div className="flex gap-2">
          {/* For global we could link to a new project wizard or a generic db wizard */}
          <Button asChild className="shrink-0 gap-2 font-medium">
             <Link href="/projects/new">
               <Plus className="h-4 w-4" />
               Nueva Base de Datos
             </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o proyecto..." 
            className="pl-9 bg-card/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {deleteModalDb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 text-center relative z-50">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight mb-2">
              Eliminar Base de Datos
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              ¿Seguro que quieres eliminar <strong>{deleteModalDb.name}</strong>? Se destruirá permanentemente de Coolify y de OLA Cloud.
            </p>
            <div className="flex justify-center gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteModalDb(null)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button onClick={confirmDeleteDb} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl border-border bg-card/40 backdrop-blur-sm">
          <Database className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">No hay bases de datos</h3>
          <p className="text-sm text-muted-foreground">
            {search ? "No se encontraron coincidencias." : "Aún no has creado ni vinculado ninguna base de datos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(db => (
            <Card key={db.id} className="border-border/50 bg-card/40 backdrop-blur-sm relative group rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors min-h-[220px]">
              <CardHeader className="py-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-xl text-blue-400 bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm">
                    <Database className="w-7 h-7 outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                      {db.status === "running" ? "Running" : db.status}
                    </span>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl tracking-tight disabled:opacity-50 font-semibold truncate">{db.name}</CardTitle>
                  <CardDescription className="flex flex-col gap-2 text-sm mt-1">
                    <span>{db.config?.engine === "postgresql" ? "PostgreSQL Database" : "Database"}</span>
                    {db.project?.name && (
                        <span className="text-[11px] text-muted-foreground font-medium bg-muted/40 px-2.5 py-1.5 rounded-md w-fit border border-border/40 inline-flex items-center gap-1.5">
                           Proyecto: <span className="text-foreground/90">{db.project.name}</span>
                        </span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="py-4 border-t border-border/20 bg-muted/5 flex flex-col justify-end gap-3 shrink-0">
                <div className="space-y-1.5 w-full">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest pl-1">Internal URL</span>
                  <code className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] bg-black/60 px-3 py-2 rounded-md border border-border/10 text-emerald-400/90 font-mono shadow-inner">
                    {db.config?.connection_uri || "N/A"}
                  </code>
                </div>
                <div className="flex w-full gap-2">
                  <Button asChild variant="secondary" className="gap-2 rounded-lg transition-all flex-1">
                    <Link href={`/projects/${db.projectId}/databases`}>
                      Gestionar en Proyecto <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-lg h-10 w-10 shrink-0 p-0 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-500 border-red-500/20 hover:border-red-500/30 transition-colors"
                    onClick={() => setDeleteModalDb({ id: db.id, name: db.name, coolifyUuid: db.config?.coolify_uuid })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
