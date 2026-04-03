export default function ProjectDomainsPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Project Domains</h1>
        <p className="text-muted-foreground mt-1">Dominios enlazados a tu aplicación.</p>
      </div>
      <div className="p-12 text-center border border-dashed rounded-xl bg-black/[0.01]">
        <h3 className="text-lg font-medium mb-2">Añadir dominio personalizado</h3>
        <p className="text-muted-foreground max-w-md mx-auto">Vincular dominios es súper fácil. Aquí inyectarás DNS verificados para dirigir tráfico a esta app.</p>
      </div>
    </div>
  )
}
