import { GlobalResourcePrompt } from "@/components/layout/global-resource-prompt"

export default function GlobalDeploymentsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground mt-1">Historial global de despliegues.</p>
      </div>
      <GlobalResourcePrompt 
        title="Selecciona un Proyecto"
        description="Para visualizar los despliegues y builds de tu código, necesitas entrar en el contexto de un proyecto específico."
      />
    </div>
  )
}
