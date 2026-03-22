import * as React from "react"
import { 
  FolderGit2, 
  Globe, 
  Activity, 
  Database,
  ArrowUpRight,
  CheckCircle2,
  Server
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const metrics = [
  { title: "Apps Activas", value: "12", icon: FolderGit2, change: "+2 este mes" },
  { title: "Dominios Configurados", value: "8", icon: Globe, change: "100% SSL válido" },
  { title: "Despliegues (30d)", value: "124", icon: Activity, change: "99.9% success rate" },
  { title: "Bases de Datos", value: "4", icon: Database, change: "24GB total" },
]

const recentActivity = [
  { id: 1, action: "Despliegue exitoso", project: "api-gateway", time: "Hace 5 minutos", status: "success" },
  { id: 2, action: "Variable entorno actualizada", project: "frontend-dashboard", time: "Hace 1 hora", status: "info" },
  { id: 3, action: "Reinicio automático", project: "worker-queue", time: "Hace 3 horas", status: "warning" },
  { id: 4, action: "Base de datos escalada", project: "main-db-prod", time: "Ayer", status: "success" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumen de Infraestructura</h1>
          <p className="text-muted-foreground mt-1">
            Métricas clave y estado de tus proyectos en OLA CLOUD.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">Nuevo Proyecto</Link>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4 bg-card/60">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos eventos en tus proyectos y recursos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <CheckCircle2 className={`h-5 w-5 ${activity.status === 'success' ? 'text-emerald-400' : activity.status === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      en <span className="text-primary/80">{activity.project}</span>
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Status */}
        <Card className="col-span-3 bg-card/60">
          <CardHeader>
            <CardTitle>Estado de Nodos</CardTitle>
            <CardDescription>
              Salud general de la infraestructura de OLA CLOUD.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-4">
                  <Server className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-semibold">BUE-1 (Principal)</h4>
                    <span className="text-xs text-muted-foreground">Carga media: 45%</span>
                  </div>
                </div>
                <Badge variant="success">Operativo</Badge>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-4">
                  <Server className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-semibold">MAD-2 (Edge)</h4>
                    <span className="text-xs text-muted-foreground">Carga media: 12%</span>
                  </div>
                </div>
                <Badge variant="success">Operativo</Badge>
              </div>
              
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-4">
                  <Database className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-semibold">DB-Cluster (HA)</h4>
                    <span className="text-xs text-muted-foreground">Replicación: Ok</span>
                  </div>
                </div>
                <Badge variant="success">Operativo</Badge>
              </div>
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full text-xs" asChild>
                <Link href="/logs">
                  Ver Logs del Sistema <ArrowUpRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
/**
 * OLA CLOUD - Dashboard Page
 * High level overview with mock metric cards and status widgets, designed with a premium SaaS look.
 */
