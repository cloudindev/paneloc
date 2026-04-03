import { GlobalResourcePrompt } from "@/components/layout/global-resource-prompt"

export default function GlobalObservabilityPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Observability</h1>
        <p className="text-muted-foreground mt-1">Métricas de rendimiento e infraestructura.</p>
      </div>
      <GlobalResourcePrompt 
        title="Selecciona un Proyecto"
        description="Para visualizar el uso de CPU, RAM y latencias, entra en los detalles de un proyecto específico."
      />
    </div>
  )
}
