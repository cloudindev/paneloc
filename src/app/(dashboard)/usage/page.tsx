import React from "react"
import { BarChart3, Database, HardDrive, Wifi, Activity } from "lucide-react"

export default function UsagePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uso de Recursos</h1>
          <p className="text-muted-foreground mt-1">
            Métricas de tu plan Pro. Ciclo actual: 1 Abr - 30 Abr.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ancho de Banda", value: "45.2 GB", total: "100 GB", percent: 45, icon: Wifi, color: "bg-blue-500" },
          { label: "Horas de Cómputo", value: "320 h", total: "1000 h", percent: 32, icon: Activity, color: "bg-emerald-500" },
          { label: "Almacenamiento BD", value: "2.1 GB", total: "10 GB", percent: 21, icon: Database, color: "bg-purple-500" },
          { label: "Archivos Estáticos", value: "14.5 GB", total: "50 GB", percent: 29, icon: HardDrive, color: "bg-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:border-primary/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 border border-border/50">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-full text-foreground/70">
                {stat.percent}%
              </span>
            </div>
            <div className="space-y-1 mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                <span className="text-sm text-muted-foreground">/ {stat.total}</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{ width: `${stat.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Tráfico de Red (30 días)
        </h3>
        <div className="bg-card w-full h-[350px] rounded-2xl border border-border/50 shadow-sm flex items-end p-8 gap-2">
          {/* Sencillo Bar Chart Dummy via flex heights */}
          {Array.from({ length: 30 }).map((_, i) => {
            const height = 20 + Math.random() * 80;
            return (
              <div key={i} className="flex-1 bg-muted-foreground/10 hover:bg-primary/50 transition-colors rounded-t-sm relative group cursor-crosshair" style={{ height: `${height}%` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {Math.floor(height * 1.5)} GB
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground px-2 font-medium">
          <span>hace 30 días</span>
          <span>hoy</span>
        </div>
      </div>
    </div>
  )
}
