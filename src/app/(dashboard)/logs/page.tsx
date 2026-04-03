import { GlobalResourcePrompt } from "@/components/layout/global-resource-prompt"

export default function GlobalLogsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground mt-1">Visor global de eventos y runtime logs.</p>
      </div>
      <GlobalResourcePrompt 
        title="Selecciona un Proyecto"
        description="Para inspeccionar el terminal en tiempo real y logs pasados, selecciona un proyecto de la lista."
      />
    </div>
  )
}
