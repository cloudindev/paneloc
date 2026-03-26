"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Terminal, ScrollText, CheckCircle2, Loader2, XCircle, Clock } from "lucide-react"
import { getDeploymentTaskLogs } from "@/app/actions/coolify"

const stripAnsi = (str: string) => {
  // Expresión regular para limpiar marcadores de color ANSI de la consola sh/bash de nixpacks
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
}

export function LogsTerminal({ resource, initialDeploymentUuid }: { resource: any, initialDeploymentUuid?: string }) {
  const [logs, setLogs] = React.useState<string>("Inicializando socket virtual...")
  const [status, setStatus] = React.useState<string>("loading")
  const [autoScroll, setAutoScroll] = React.useState<boolean>(true)
  const preRef = React.useRef<HTMLPreElement>(null)

  React.useEffect(() => {
    if (!initialDeploymentUuid) {
      setLogs("No hay despliegues registrados para este proyecto. Despliega la aplicación primero para obtener logs de compilación.")
      setStatus("unknown")
      return
    }

    let intervalId: NodeJS.Timeout

    const fetchLogs = async () => {
      const res = await getDeploymentTaskLogs(initialDeploymentUuid)
      if (res.success) {
        setLogs(stripAnsi(res.logs || "Esperando logs del contenedor..."))
        setStatus(res.status)

        // Detener web-polling si alcanzó estado terminal (minimiza estrés de API)
        if (res.status === 'finished' || res.status === 'failed' || res.status === 'error') {
          clearInterval(intervalId)
        }
      } else {
        setLogs((prev) => prev + `\n\n[SISTEMA] Conexión interrumpida con el backend de contenedores: ${res.error}`)
        setStatus("error")
        clearInterval(intervalId)
      }
    }

    // Disparo inmediato
    fetchLogs()

    // Polling contínuo Antigravity
    intervalId = setInterval(fetchLogs, 2500)

    return () => clearInterval(intervalId)
  }, [initialDeploymentUuid])

  React.useEffect(() => {
    if (autoScroll && preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const handleScroll = (e: React.UIEvent<HTMLPreElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // Si el usuario sube manualmente más de 50px de diferencia, frenamos el anclaje abajo
    if (scrollHeight - scrollTop - clientHeight > 50) {
      setAutoScroll(false)
    } else {
      setAutoScroll(true)
    }
  }

  return (
    <Card className="flex flex-col flex-1 min-h-[600px] border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800 shadow-sm">
            <Terminal className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              Consola de Compilación
              {status === 'in_progress' && <span className="flex items-center text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Compilando</span>}
              {status === 'finished' && <span className="flex items-center text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"><CheckCircle2 className="w-3 h-3 mr-1" /> Finalizado</span>}
              {(status === 'failed' || status === 'error') && <span className="flex items-center text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"><XCircle className="w-3 h-3 mr-1" /> Fallido</span>}
              {status === 'queued' && <span className="flex items-center text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"><Clock className="w-3 h-3 mr-1" /> En cola</span>}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground text-[11px] font-mono tracking-wide">ID Tarea: {initialDeploymentUuid || "N/A"}</span>
            </div>
          </div>
        </div>
        <Button variant={autoScroll ? "default" : "outline"} size="sm" onClick={() => setAutoScroll(true)} disabled={autoScroll} className="text-xs h-8">
          <ScrollText className="h-3 w-3 mr-1.5" /> Auto-Scroll {autoScroll ? "ON" : "OFF"}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden relative bg-[#0c0c0c]">
        <pre 
          ref={preRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-auto p-6 text-[13px] font-mono text-zinc-300 leading-relaxed break-words whitespace-pre-wrap select-text focus:outline-none"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#3f3f46 #0c0c0c" }}
        >
          {logs}
        </pre>
      </CardContent>
    </Card>
  )
}
