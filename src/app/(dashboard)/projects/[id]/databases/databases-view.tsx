"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, Server, ChevronRight, CheckCircle2, Loader2, ArrowLeft, DownloadCloud, Shield, Lock, Eye, EyeOff, Trash2, TerminalSquare, Play, Search, MoreVertical, KeyRound, CalendarDays, X, UploadCloud, FileUp } from "lucide-react"
import { createCoolifyDatabase, deleteDatabaseFromCoolify, executeDatabaseQuery } from "@/app/actions/coolify"
import { linkExternalDatabase } from "@/app/actions/projects"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

function SqlConsole({ dbId }: { dbId: string }) {
  const [query, setQuery] = React.useState("")
  const [isRunning, setIsRunning] = React.useState(false)
  const [result, setResult] = React.useState<{ success: boolean; rows?: any[]; fields?: string[]; error?: string; command?: string; rowCount?: number } | null>(null)

  const handleRun = async () => {
    if (!query.trim()) return
    setIsRunning(true)
    setResult(null)
    const res = await executeDatabaseQuery(dbId, query)
    setResult(res as any)
    setIsRunning(false)
  }

  return (
    <div className="mt-4 pt-4 border-t border-border/20 space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM pg_catalog.pg_tables;"
            className="w-full min-h-[100px] bg-black/40 text-emerald-400 font-mono text-xs p-3 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 resize-y border border-border/20"
            spellCheck={false}
          />
        </div>
        <Button 
          onClick={handleRun} 
          disabled={isRunning || !query.trim()}
          className="h-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Run
        </Button>
      </div>

      {result && (
        <div className="bg-black/20 rounded border border-border/20 overflow-hidden mt-4">
          {result.error ? (
            <div className="p-3 text-xs text-red-400 font-mono bg-red-500/10">
              Error: {result.error}
            </div>
          ) : (
            <div>
              <div className="px-3 py-2 bg-muted/30 border-b border-border/20 flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-mono">
                  {result.command} OK ({result.rowCount} rows)
                </span>
              </div>
              {result.rows && result.rows.length > 0 ? (
                <div className="max-h-[300px] overflow-auto">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm shadow-sm">
                      <tr>
                        {result.fields?.map((f, i) => (
                          <th key={i} className="px-3 py-2 text-muted-foreground font-medium border-b border-border/20">
                            {f}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {result.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/20 transition-colors">
                          {result.fields?.map((f, colIdx) => (
                            <td key={colIdx} className="px-3 py-2 font-mono text-emerald-300/80">
                              {row[f] === null ? <span className="text-muted-foreground/50 italic">null</span> : String(row[f])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No rows returned
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DatabaseSquareCard({ db, handleDeleteDb, isDeleting, onOpenDetail, resourceName }: any) {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm relative group rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between aspect-square max-w-sm hover:border-primary/50 transition-colors">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDb(db.id, db.config?.coolify_uuid)} disabled={isDeleting === db.id}>
            {isDeleting === db.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
      </div>
      <CardHeader className="py-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="w-14 h-14 rounded-xl text-blue-400 bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm">
            <Database className="w-7 h-7 outline-none" />
          </div>
          <span className="text-[11px] bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
            {db.status === "running" ? "Running" : db.status}
          </span>
        </div>
        <div>
          <CardTitle className="text-xl tracking-tight disabled:opacity-50 font-semibold truncate">{db.name}</CardTitle>
          <CardDescription className="flex flex-col gap-2 text-sm mt-1">
             <span>{db.config?.engine === "postgresql" ? "PostgreSQL Database" : "Database"}</span>
             {resourceName && (
                <span className="text-[11px] text-muted-foreground font-medium bg-muted/40 px-2.5 py-1.5 rounded-md w-fit border border-border/40 inline-flex items-center gap-1.5">
                   Proyecto: <span className="text-foreground/90">{resourceName}</span>
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
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button variant="secondary" className="gap-2 rounded-lg transition-all w-full" onClick={() => onOpenDetail(db.id, 'sql')}>
            <TerminalSquare className="w-4 h-4" /> Editor SQL
          </Button>
          <Button variant="secondary" className="gap-2 rounded-lg transition-all w-full" onClick={() => onOpenDetail(db.id, 'tables')}>
            <Database className="w-4 h-4" /> Tablas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DatabaseDetailView({ db, initialView, onBack }: { db: any, initialView: 'sql' | 'tables', onBack: () => void }) {
  const [activeView, setActiveView] = React.useState<'sql' | 'tables' | 'columns'>(initialView);
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  
  const [tables, setTables] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<any[]>([]);
  const [loadingTables, setLoadingTables] = React.useState(true);
  const [loadingColumns, setLoadingColumns] = React.useState(false);
  
  const [searchTableQuery, setSearchTableQuery] = React.useState("");
  const [searchColumnQuery, setSearchColumnQuery] = React.useState("");

  React.useEffect(() => {
    async function loadTables() {
       setLoadingTables(true);
       try {
         const query = `
            SELECT 
                t.table_name as name, 
                c.columns as columns, 
                COALESCE((SELECT reltuples::bigint FROM pg_class WHERE relname = t.table_name), 0) as rows,
                pg_size_pretty(pg_relation_size('"' || t.table_name || '"')) as size
            FROM 
                information_schema.tables t
            LEFT JOIN (
                SELECT table_name, count(*) as columns 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                GROUP BY table_name
            ) c ON t.table_name = c.table_name
            WHERE 
                t.table_schema = 'public' 
                AND t.table_type = 'BASE TABLE'
            ORDER BY t.table_name;
         `;
         const res = await executeDatabaseQuery(db.id, query);
         if (res && res.success && res.rows) {
            setTables(res.rows.map((r: any) => ({
               ...r,
               realtime: false // We leave false as it requires deeper supabase inspection
            })));
         }
       } catch (error) {
         console.error("Error loading tables:", error);
       } finally {
         setLoadingTables(false);
       }
    }
    loadTables();
  }, [db.id]);

  const handleTableClick = async (tableName: string) => {
    setSelectedTable(tableName);
    setActiveView('columns');
    setLoadingColumns(true);
    setColumns([]);
    
    try {
      const query = `
         SELECT 
             c.column_name as name, 
             c.data_type as type,
             c.is_nullable as nullable,
             (
                 SELECT COUNT(*) > 0
                 FROM information_schema.table_constraints tc 
                 JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
                 WHERE tc.constraint_type = 'PRIMARY KEY' 
                 AND tc.table_schema = c.table_schema 
                 AND tc.table_name = c.table_name 
                 AND ccu.column_name = c.column_name
             ) as is_primary
         FROM 
             information_schema.columns c
         WHERE 
             c.table_schema = 'public' 
             AND c.table_name = '${tableName}'
         ORDER BY c.ordinal_position;
      `;
      const res = await executeDatabaseQuery(db.id, query);
      if (res && res.success && res.rows) {
         setColumns(res.rows.map((r: any) => ({
            name: r.name,
            type: r.type,
            primary: r.is_primary === true || r.is_primary === 't' || r.is_primary === 'true',
            nullable: r.nullable === 'YES',
            icon: r.type.includes('timestamp') || r.type.includes('date') ? 'C' : 'T'
         })));
      }
    } catch (error) {
      console.error("Error loading columns:", error);
    } finally {
      setLoadingColumns(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 border-b border-border/50 pb-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground -ml-4">
             <ArrowLeft className="w-5 h-5" /> Volver a Bases de datos
          </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-2">
         <div className="flex bg-muted p-1 rounded-lg border border-border/50 w-fit">
            <button 
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'sql' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
               onClick={() => setActiveView('sql')}
            >
               Editor SQL
            </button>
            <button 
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'tables' || activeView === 'columns' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
               onClick={() => setActiveView('tables')}
            >
               Tablas
            </button>
         </div>
         <h2 className="text-xl font-bold tracking-tight text-muted-foreground ml-2">/ {db.name}</h2>
      </div>

      {activeView === 'sql' && (
        <Card className="bg-card/60 backdrop-blur-md rounded-xl shadow-sm overflow-hidden">
           <CardHeader className="py-3 px-4 border-b border-border/20 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><TerminalSquare className="h-4 w-4 text-emerald-500"/> Console</CardTitle>
           </CardHeader>
           <CardContent className="p-4 bg-muted/5">
             <SqlConsole dbId={db.id} />
           </CardContent>
        </Card>
      )}

      {activeView === 'tables' && (
        <div className="space-y-4 pb-12 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-card p-4 rounded-xl border shadow-sm gap-4">
             <h3 className="text-xl font-semibold tracking-tight flex items-center">
                 Database Tables
             </h3>
             <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-muted rounded-md p-1 border border-border/50 items-center">
                    <span className="px-3 py-1 text-xs text-muted-foreground">schema</span>
                    <span className="bg-background rounded px-3 py-1 text-xs font-medium shadow-sm">public</span>
                </div>
                <div className="relative">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input 
                     placeholder="Search for a table..." 
                     className="pl-9 h-10 w-full sm:w-64 bg-background" 
                     value={searchTableQuery}
                     onChange={(e) => setSearchTableQuery(e.target.value)}
                   />
                </div>
             </div>
          </div>
          
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 border-b border-border/50 text-[11px] text-muted-foreground/80 uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Columns</th>
                      <th className="px-6 py-4 font-medium">Rows (Estimated)</th>
                      <th className="px-6 py-4 font-medium">Size (Estimated)</th>
                      <th className="px-6 py-4 font-medium">Realtime</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-[13px]">
                    {loadingTables ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                           <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                           Cargando tablas...
                        </td>
                      </tr>
                    ) : tables.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                           No hay tablas en la base de datos.
                        </td>
                      </tr>
                    ) : tables
                        .filter(table => table.name.toLowerCase().includes(searchTableQuery.toLowerCase()))
                        .map((table, idx) => (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3 font-medium text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => handleTableClick(table.name)}>
                              <Database className="w-4 h-4 text-muted-foreground/60" />
                              {table.name}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{table.columns}</td>
                        <td className="px-6 py-4 text-muted-foreground">{table.rows}</td>
                        <td className="px-6 py-4 text-muted-foreground">{table.size}</td>
                        <td className="px-6 py-4">
                           {table.realtime ? (
                              <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                 <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                              </span>
                           ) : (
                              <span className="flex items-center gap-1.5 text-muted-foreground/70">
                                 <X className="w-3.5 h-3.5" /> Disabled
                              </span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="outline" size="sm" className="h-8 shadow-sm text-xs" onClick={() => handleTableClick(table.name)}>
                                 View columns
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 shadow-sm">
                                 <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
             <div className="px-6 py-3 border-t border-border/50 bg-muted/5 text-xs text-muted-foreground">
                {!loadingTables && `${tables.length} tables`}
             </div>
          </div>
        </div>
      )}

      {activeView === 'columns' && selectedTable && (
        <div className="space-y-4 pb-12 animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" className="h-8 pl-0 text-muted-foreground hover:text-foreground" onClick={() => setActiveView('tables')}>
                   <ArrowLeft className="w-4 h-4 mr-1" /> Tables
                </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
               <h2 className="text-3xl font-bold tracking-tight">{selectedTable}</h2>
               <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input 
                     placeholder="Filter columns" 
                     className="pl-9 bg-card h-10" 
                     value={searchColumnQuery}
                     onChange={(e) => setSearchColumnQuery(e.target.value)}
                   />
               </div>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-border/50 text-[11px] text-muted-foreground/80 uppercase font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-medium w-64">Name</th>
                        <th className="px-6 py-4 font-medium w-48">Type</th>
                        <th className="px-6 py-4 font-medium">Constraints</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-[13px]">
                       {loadingColumns ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                               <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                               Cargando columnas...
                            </td>
                          </tr>
                       ) : columns.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                               No hay columnas para mostrar.
                            </td>
                          </tr>
                       ) : columns
                           .filter(col => col.name.toLowerCase().includes(searchColumnQuery.toLowerCase()))
                           .map((col, idx) => (
                          <tr key={idx} className="hover:bg-muted/10 transition-colors group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3 font-medium text-foreground">
                                  <span className="text-muted-foreground/40 font-serif italic text-lg leading-none w-5 text-center">
                                    {col.icon === 'C' ? <CalendarDays className="w-4 h-4 inline-block" /> : 'T'}
                                  </span> 
                                  {col.name}
                                </div>
                             </td>
                             <td className="px-6 py-4 text-muted-foreground font-mono text-[12px]">{col.type}</td>
                             <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {col.primary && (
                                       <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 text-emerald-500 bg-emerald-500/5 uppercase tracking-wide">
                                          <KeyRound className="w-3 h-3" /> Primary
                                       </span>
                                    )}
                                    {col.nullable ? (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-border/50 text-muted-foreground bg-muted/20 tracking-wide">
                                           <span className="w-2 h-2 rounded-sm border border-muted-foreground/50 rotate-45 inline-block" /> Nullable
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-border/50 text-foreground/80 bg-muted/40 tracking-wide">
                                           <span className="w-2 h-2 rounded-sm bg-muted-foreground/80 rotate-45 inline-block" /> Non-nullable
                                        </span>
                                    )}
                                </div>
                             </td>
                             <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm" className="h-8 shadow-sm text-xs px-4">
                                       Edit
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8 shadow-sm">
                                       <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Button>
                                 </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
               <div className="px-6 py-3 border-t border-border/50 bg-muted/5 text-xs text-muted-foreground">
                  {!loadingColumns && `${columns.length} columns`}
               </div>
            </div>
        </div>
      )}
    </div>
  )
}


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
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
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
  
  // Link state
  const [linkName, setLinkName] = React.useState("")
  const [linkUri, setLinkUri] = React.useState("")
  const [isLinking, setIsLinking] = React.useState(false)
  
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  
  // Detalle DB activo from URL
  const detailDbId = searchParams.get('detailDb')
  const detailViewMode = searchParams.get('view') as 'sql' | 'tables' | null
  
  const [showCatalog, setShowCatalog] = React.useState(initialDatabases.length === 0)

  // Derived state
  const activeDbDetail = detailDbId ? { dbId: detailDbId, initialView: detailViewMode || 'tables' } : null

  const handleOpenDetail = (dbId: string, view: 'sql' | 'tables') => {
    const params = new URLSearchParams(searchParams)
    params.set('detailDb', dbId)
    params.set('view', view)
    router.push(`${pathname}?${params.toString()}`)
  }
  
  const handleCloseDetail = () => {
    // Navigate strictly to the base pathname which resets searchParams fully
    router.push(pathname)
  }

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

  const handleLink = async () => {
    if (!linkName || !linkUri) return
    setIsLinking(true)
    
    const res = await linkExternalDatabase(resource.projectId, resource.id, {
      name: linkName,
      uri: linkUri,
      engine: selectedEngine!.id
    })

    setIsLinking(false)
    if (res.success) {
      setStep(0)
      router.refresh()
    } else {
      alert("Error al enlazar base de datos: " + res.error)
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
      isPublic,
      linkedAppId: resource.id
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
      if (activeDbDetail) {
         const targetDb = initialDatabases.find(d => d.id === activeDbDetail.dbId)
         if (targetDb) {
            return (
               <DatabaseDetailView 
                  key={targetDb.id} // para forzar remount si cambia
                  db={targetDb} 
                  initialView={activeDbDetail.initialView as any} 
                  onBack={handleCloseDetail} 
               />
            )
         }
      }

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
            {initialDatabases.map((db: any) => (
              <DatabaseSquareCard 
                key={db.id} 
                db={db} 
                handleDeleteDb={handleDeleteDb} 
                isDeleting={isDeleting} 
                onOpenDetail={handleOpenDetail}
                resourceName={resource.name}
              />
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

         <div className="grid sm:grid-cols-3 gap-4">
            <Card className="hover:border-primary/50 cursor-pointer transition-colors group bg-card hover:bg-card/80" onClick={() => setStep(2)}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Crear Nueva</h3>
                  <p className="text-sm text-muted-foreground">Desplegar instancia virgen dedicada.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 cursor-pointer transition-colors group bg-card hover:bg-card/80" onClick={() => setStep(5)}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DownloadCloud className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Enlazar Existente</h3>
                  <p className="text-sm text-muted-foreground">Conecta DB por URI (AWS, Supabase, etc).</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 cursor-pointer transition-colors group bg-card hover:bg-card/80" onClick={() => setStep(6)}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Importar DB</h3>
                  <p className="text-sm text-muted-foreground">Crear a partir de dump SQL o backup.</p>
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

  {/* Vista para Enlazar Existente */}
  if (step === 5) {
    const Icon = selectedEngine!.icon
    return (
       <div className="max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-500">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground pl-0 group" onClick={() => setStep(1)} disabled={isLinking}>
           <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
           Volver atrás
         </Button>

         <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
           <CardHeader className="border-b border-border/20 bg-muted/10">
             <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${selectedEngine!.color}`}>
                  <DownloadCloud className="w-4 h-4 text-emerald-500" />
               </div>
               <div>
                  <CardTitle className="text-lg">Enlazar Base de Datos Existente</CardTitle>
                  <CardDescription>Integrar una base externa accesible públicamente.</CardDescription>
               </div>
             </div>
           </CardHeader>

           <CardContent className="p-6 space-y-6">
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Nombre de Referencia</label>
                 <Input 
                   value={linkName} 
                   onChange={e => setLinkName(e.target.value)} 
                   placeholder="Mi DB AWS"
                   className="bg-background/50"
                 />
                 <p className="text-xs text-muted-foreground">El identificador interno con el que aparecerá en el panel.</p>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-medium">Cadena de Conexión (URI)</label>
                 <Input 
                   type="password"
                   value={linkUri} 
                   onChange={e => setLinkUri(e.target.value)} 
                   placeholder="postgres://user:password@host:5432/dbname"
                   className="bg-background/50 font-mono text-sm"
                 />
                 <p className="text-xs text-muted-foreground">URI válida tipo postgres:// o mysql://.</p>
               </div>
             </div>
           </CardContent>

           <CardFooter className="p-6 pt-0 flex justify-end">
             <Button 
               size="lg" 
               className="gap-2 font-medium bg-emerald-600 hover:bg-emerald-700 text-white" 
               onClick={handleLink}
               disabled={!linkName || !linkUri || isLinking}
             >
               {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
               {isLinking ? "Conectando..." : "Conectar Base de Datos"}
             </Button>
           </CardFooter>
         </Card>
      </div>
    )
  }

  {/* Vista para Importar SQL */}
  if (step === 6) {
    const Icon = selectedEngine!.icon
    return (
       <div className="max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-500">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground pl-0 group" onClick={() => setStep(1)}>
           <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
           Volver atrás
         </Button>

         <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden text-center py-12">
           <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                <FileUp className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold mt-4">Importar DB Próximamente</h2>
              <p className="text-muted-foreground max-w-sm">
                Estamos terminando el importador que te permitirá subir tu archivo .SQL para desplegar e hidratar la base de datos en un solo paso.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setStep(1)}>
                Entendido
              </Button>
           </CardContent>
         </Card>
      </div>
    )
  }

  return null
}
