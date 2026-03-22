"use client"

import * as React from "react"
import { Terminal, Download, Copy, Play, Pause, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const mockLogs = [
  { id: 1, time: "2024-03-22T10:15:30.123Z", level: "info", service: "api-gateway", message: "Request handled successfully" },
  { id: 2, time: "2024-03-22T10:15:31.045Z", level: "info", service: "auth-worker", message: "User session validated" },
  { id: 3, time: "2024-03-22T10:15:32.412Z", level: "warn", service: "main-db", message: "Query execution time > 500ms" },
  { id: 4, time: "2024-03-22T10:15:33.890Z", level: "error", service: "payment-svc", message: "Stripe webhook failed: Timeout" },
  { id: 5, time: "2024-03-22T10:15:34.100Z", level: "info", service: "payment-svc", message: "Retrying webhook delivery..." },
  { id: 6, time: "2024-03-22T10:15:35.500Z", level: "info", service: "api-gateway", message: "[GET] /api/v1/users - 200 OK" },
  { id: 7, time: "2024-03-22T10:15:36.220Z", level: "info", service: "image-worker", message: "Image compression completed: asset_291.jpg" },
  { id: 8, time: "2024-03-22T10:15:38.001Z", level: "error", service: "mail-svc", message: "Failed to send email: SMTP connection refused" },
]

export default function LogsPage() {
  const [isPlaying, setIsPlaying] = React.useState(true)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs del Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Visualizador en tiempo real de los eventos en tu infraestructura.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? (
              <span className="flex items-center gap-2"><Pause className="h-4 w-4" /> Pausar</span>
            ) : (
              <span className="flex items-center gap-2 text-primary"><Play className="h-4 w-4" /> Reanudar</span>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="flex-1 rounded-xl border border-border bg-[#050510] relative flex flex-col overflow-hidden shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-border/50 bg-[#0f111a] px-4 py-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Terminal className="h-4 w-4" />
            <span>ola-terminal-v1.2 // Live Stream</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-muted-foreground hover:text-primary">
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-muted-foreground hover:text-primary">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
          {mockLogs.map((log) => (
            <div key={log.id} className="flex gap-4 py-1.5 hover:bg-white/5 transition-colors group">
              <span className="text-muted-foreground/50 shrink-0 w-48 hidden sm:inline-block">
                {log.time}
              </span>
              <span className={`shrink-0 w-16 uppercase text-xs font-semibold self-center
                ${log.level === 'info' ? 'text-blue-400' : 
                  log.level === 'warn' ? 'text-amber-400' : 
                  'text-red-400'}`
              }>
                {log.level}
              </span>
              <span className="text-muted-foreground shrink-0 w-32 hidden md:inline-block">
                [{log.service}]
              </span>
              <span className={`flex-1 break-all ${log.level === 'error' ? 'text-red-300' : 'text-foreground/90'}`}>
                {log.message}
              </span>
            </div>
          ))}
          
          {isPlaying && (
            <div className="flex items-center gap-2 mt-4 text-primary animate-pulse">
              <span className="w-2 h-4 bg-primary inline-block animate-ping rounded-sm" />
              <span className="text-xs">Esperando eventos...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
/**
 * OLA CLOUD - Logs Viewer Component
 * Code/Terminal style viewer mimicking a real cloud interface with pause/play mechanics.
 */
