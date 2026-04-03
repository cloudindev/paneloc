export default function DatabasesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Databases</h1>
        <p className="text-muted-foreground mt-1">Bases de datos aisladas y compartidas.</p>
      </div>
      <div className="p-12 text-center border border-dashed rounded-xl bg-black/[0.01]">
        <h3 className="text-lg font-medium mb-2">Sección Global de Bases de Datos</h3>
        <p className="text-muted-foreground max-w-md mx-auto">Aquí se mostrará el listado de todos los clústeres de bases de datos que no están anidados exclusivamente dentro de un proyecto, o el resumen global de los mismos.</p>
      </div>
    </div>
  )
}
