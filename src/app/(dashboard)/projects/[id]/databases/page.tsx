import { redirect } from "next/navigation"
import { getResourceById } from "@/app/actions/projects"
import { DatabasesView } from "./databases-view"

export default async function ProjectDatabasesPage({ params }: { params: { id: string } }) {
  const project = await getResourceById(params.id)
  
  if (!project) {
    redirect("/projects")
  }

  // Provisional: Fetchearemos las BD de Coolify o de la DB local en un futuro
  const databases: any[] = []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Bases de Datos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las bases de datos de tu proyecto.
        </p>
      </div>

      <DatabasesView resource={project} initialDatabases={databases} />
    </div>
  )
}
