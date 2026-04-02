import { redirect } from "next/navigation"
import { getResourceById, getProjectDatabases } from "@/app/actions/projects"
import { DatabasesView } from "./databases-view"

import { Suspense } from "react"

export default async function ProjectDatabasesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getResourceById(id)
  
  if (!project) {
    redirect("/projects")
  }

  // Fetch persisted databases from DB
  const databases = await getProjectDatabases(project.projectId, project.id)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Bases de Datos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las bases de datos de tu proyecto.
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-64 bg-muted/20 rounded-md" />}>
        <DatabasesView resource={project} initialDatabases={databases} />
      </Suspense>
    </div>
  )
}
