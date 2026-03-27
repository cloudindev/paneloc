"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, Server, ChevronRight, CheckCircle2, Loader2, ArrowLeft, DownloadCloud, Shield, Lock, Eye, EyeOff, Trash2 } from "lucide-react"
import { createCoolifyDatabase, deleteDatabaseFromCoolify } from "@/app/actions/coolify"
import { useRouter } from "next/navigation"

const ENGINES = [
  {
    id: "postgresql",
    name: "PostgreSQL",
    description: "PostgreSQL is an object-relational database known for its robustness, advanced features, and strong performance.",
    color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    icon: Database,
    enabled: true
  },
  {
    id: "mysql",
    name: "MySQL",
    description: "The world's most popular open source database, widely used for web scraping and e-commerce.",
    color: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    icon: Server,
    enabled: false
  },
  {
    id: "redis",
    name: "Redis",
    description: "In-memory data structure store, used as a distributed, in-memory key–value database, cache and message broker.",
    color: "bg-red-500/10 border-red-500/20 text-red-400",
    icon: Database,
    enabled: false
  }
]

export function DatabasesView({ resource, initialDatabases }: { resource: any, initialDatabases: any[] }) {
  const router = useRouter()
  // 0: Browse existing / select engine to create, 1: Choose mode (Create vs Connect), 2: Form Create, 3: Deploying, 4: Success
  const [step, setStep] = React.useState(0)
  const [selectedEngine, setSelectedEngine] = React.useState<any>(null)
  
  // Create form state
  const [dbName, setDbName] = React.useState(resource.name + "-db")
  const [dbUser, setDbUser] = React.useState("postgres")
  const [dbPassword, setDbPassword] = React.useState(() => Math.random().toString(36).slice(-12) + "A1!")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isPublic, setIsPublic] = React.useState(false)
  const [connectionString, setConnectionString] = React.useState("")
  
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)

  const [showCatalog, setShowCatalog] = React.useState(initialDatabases.length === 0)

  const handleEngineClick = (engine: any) => {
    if (!engine.enabled) return
    setSelectedEngine(engine)
    setStep(1)
  }

  const handleDeleteDb = async (dbId: string, coolifyUuid: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta base de datos y todos sus volúmenes de almacenamiento? Esta acción es irreversible.")) return
    
    setIsDeleting(dbId)
    const res = await deleteDatabaseFromCoolify(dbId, coolifyUuid)
    setIsDeleting(null)
    
    if (res.success) {
      router.refresh()
    } else {
      alert("Error eliminando base de datos: " + res.error)
    }
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    setStep(3)
    
    // Convert isPublic to public_port config behavior if necessary
    const res = await createCoolifyDatabase(resource.projectId, {
      engine: selectedEngine.id,
      name: dbName,
      user: dbUser,
      password: dbPassword,
      isPublic
    })
    
    if (res.success && res.connectionString) {
      setConnectionString(res.connectionString)
      setStep(4)
    } else {
      alert("Error instalando DB: " + res.error)
      setStep(2) // volver al form
    }
    
    setIsDeploying(false)
  }

  const reset = () => {
    setStep(0)
    setSelectedEngine(null)
    setShowCatalog(false)
    router.refresh()
  }

  if (step === 0) {
    if (!showCatalog && initialDatabases.length > 0) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground/90 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> Mis Bases de Datos
            </h2>
            <Button onClick={() => setShowCatalog(true)} className="gap-2">
              <Database className="w-4 h-4" /> Añadir Base de Datos
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {initialDatabases.map((db: any) => (
              <Card key={db.id} className="border-border/50 bg-card/40 backdrop-blur-sm relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteDb(db.id, db.config?.coolify_uuid)}
                    disabled={isDeleting === db.id}
                  >
                    {isDeleting === db.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center pr-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded text-blue-400 bg-blue-500/10 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg disabled:opacity-50">{db.name}</CardTitle>
                        <CardDescription>{db.config?.engine === "postgresql" ? "PostgreSQL Database" : "Database"}</CardDescription>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-medium flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {db.status === "running" ? "Running" : db.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-4 border-t border-border/20 bg-muted/5">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Internal URL</span>
                    <code className="block w-full overflow-x-auto text-xs bg-black/40 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 text-emerald-400/90 font-mono">
                      {db.config?.connection_uri || "N/A"}
                    </code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {initialDatabases.length > 0 && (
          <Button variant="ghost" onClick={() => setShowCatalog(false)} className="mb-2 pl-0 text-muted-foreground group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver a mis bases de datos
          </Button>
        )}
        
        <div>
          <h2 className="text-xl font-semibold mb-6 text-foreground/90 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary shrink-0">
              <Database className="w-4 h-4" />
            </span>
            Catálogo de Bases de Datos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENGINES.map((engine) => {
              const Icon = engine.icon
              return (
                <Card 
                  key={engine.id}
                  className={`relative overflow-hidden transition-all duration-300 ${engine.enabled ? 'hover:border-primary/50 cursor-pointer hover:shadow-lg hover:shadow-primary/5' : 'opacity-60 grayscale cursor-not-allowed bg-muted/20'}`}
                  onClick={() => handleEngineClick(engine)}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${engine.color} mb-3`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {!engine.enabled && (
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-background px-2 py-1 border border-border/50 rounded-full text-muted-foreground mr-1">
                          Próximamente
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{engine.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {engine.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    const Icon = selectedEngine.icon
    return (
       <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Button variant="ghost" className="mb-2 text-muted-foreground hover:text-foreground pl-0 group" onClick={() => setStep(0)}>
           <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
           Volver al catálogo
         </Button>
         
         <div className="flex items-center gap-4 mb-8">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${selectedEngine.color}`}>
              <Icon className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-2xl font-bold">{selectedEngine.name}</h2>
             <p className="text-muted-foreground">Configuración de servicio para el proyecto {resource.name}</p>
           </div>
         </div>

         <div className="grid sm:grid-cols-2 gap-4">
            <Card className="hover:border-primary/50 cursor-pointer transition-colors group bg-card hover:bg-card/80" onClick={() => setStep(2)}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Crear Nueva</h3>
                  <p className="text-sm text-muted-foreground">Desplegaremos una instancia virgen dedicada y segura de {selectedEngine.name} en el servidor VM101.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 cursor-pointer transition-colors group bg-card hover:bg-card/80" onClick={() => alert("Función de enlace externo en desarrollo.")}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DownloadCloud className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Enlazar Existente</h3>
                  <p className="text-sm text-muted-foreground">Conecta mediante una URI de conexión una base de datos alojada en AWS, Supabase u otro proveedor.</p>
                </div>
              </CardContent>
            </Card>
         </div>
       </div>
    )
  }

  if (step === 2 || step === 3) {
    const Icon = selectedEngine.icon
    return (
       <div className="max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-500">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground pl-0 group" onClick={() => setStep(!isDeploying ? 1 : step)} disabled={isDeploying}>
           <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
           Volver atrás
         </Button>

         <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
           <CardHeader className="border-b border-border/20 bg-muted/10">
             <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${selectedEngine.color}`}>
                  <Icon className="w-4 h-4" />
               </div>
               <div>
                  <CardTitle className="text-lg">Configuración de Instancia</CardTitle>
                  <CardDescription>Parámetros seguros por defecto listos para producción.</CardDescription>
               </div>
             </div>
           </CardHeader>

           {step === 2 && (
             <CardContent className="p-6 space-y-6">
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Nombre de la Base de Datos</label>
                   <Input 
                     value={dbName} 
                     onChange={e => setDbName(e.target.value)} 
                     placeholder="app-db"
                     className="bg-background/50"
                   />
                   <p className="text-xs text-muted-foreground">El identificador interno del volumen.</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Usuario Maestro</label>
                     <Input 
                       value={dbUser} 
                       onChange={e => setDbUser(e.target.value)} 
                       placeholder="postgres"
                       className="bg-background/50"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Contraseña Maestra</label>
                     <div className="relative">
                       <Input 
                         type={showPassword ? "text" : "password"}
                         value={dbPassword} 
                         onChange={e => setDbPassword(e.target.value)} 
                         className="bg-background/50 pr-10 font-mono text-sm"
                       />
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="absolute right-1 top-1 h-7 w-7 text-muted-foreground" 
                         onClick={() => setShowPassword(!showPassword)}
                       >
                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </Button>
                     </div>
                   </div>
                 </div>

                 <div className="pt-4 border-t border-border/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-500" />
                          Acceso Externo (Red Pública)
                        </label>
                        <p className="text-sm text-muted-foreground">Si está activo, mapearemos un puerto aleatorio hacia internet. Recomendamos VPN.</p>
                      </div>
                      <div 
                        className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${isPublic ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        onClick={() => setIsPublic(!isPublic)}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>
                 </div>
               </div>
             </CardContent>
           )}

           {step === 3 && (
             <CardContent className="p-12 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                  <Server className="w-8 h-8 text-muted-foreground animate-pulse" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Aprovisionando Instancia VM101</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">Erigiendo los volúmenes en el servidor, configurando redes y cifrando credenciales...</p>
             </CardContent>
           )}

           {step === 2 && (
             <CardFooter className="bg-muted/10 p-4 border-t border-border/20 flex justify-end">
               <Button onClick={handleDeploy} disabled={isDeploying} className="gap-2 px-6">
                 {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar Despliegue"} {isDeploying ? "" : <ChevronRight className="w-4 h-4" />}
               </Button>
             </CardFooter>
           )}
         </Card>
       </div>
    )
  }

  if (step === 4) {
    return (
      <div className="max-w-xl mx-auto mt-12 animate-in zoom-in-95 duration-500 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">¡Base de Datos En Línea!</h2>
          <p className="text-muted-foreground">Tu PostgreSQL ha sido aprovisionada y configurada exitosamente.</p>
        </div>
        <Card className="w-full text-left bg-muted/20 border-border/50">
          <CardContent className="p-4 space-y-3">
             <div className="flex justify-between items-center py-2 border-b border-border/20">
               <span className="text-sm text-muted-foreground">Estado</span>
               <span className="text-sm font-medium text-emerald-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-500/50" /> Running</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-border/20">
               <span className="text-sm text-muted-foreground">Internal URL (Nixpacks)</span>
               <code className="text-xs bg-black/40 px-2 py-1 rounded border border-border/30 font-mono text-primary/80">
                 {connectionString}
               </code>
             </div>
          </CardContent>
        </Card>
        <Button onClick={reset} variant="secondary" className="w-full mt-4">
          Cerrar y volver al Panel
        </Button>
      </div>
    )
  }

  return null
}
