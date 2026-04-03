export default function ProjectObservabilityPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Observability</h1>
        <p className="text-muted-foreground mt-1">Métricas específicas del proyecto.</p>
      </div>
      <div className="p-12 text-center border border-dashed rounded-xl bg-black/[0.01]">
        <h3 className="text-lg font-medium mb-2">Métricas e Insights</h3>
        <p className="text-muted-foreground max-w-md mx-auto">Paneles interactivos de CPU, memoria, red y web vitals para tu aplicación.</p>
      </div>
    </div>
  )
}
