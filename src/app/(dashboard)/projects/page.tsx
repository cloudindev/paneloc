import * as React from "react"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectsGrid } from "./projects-grid"
import { getProjectsFromDB } from "@/app/actions/projects"

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const initialProjects = await getProjectsFromDB()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus aplicaciones web y servicios backend.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/projects/new">
            <PlusCircle className="h-4 w-4" />
            Nueva App
          </Link>
        </Button>
      </div>

      <ProjectsGrid initialProjects={initialProjects} />
    </div>
  )
}
/**
 * OLA CLOUD - Projects List Component
 * Clean hybrid component merging DB speed with Coolify API liveliness.
 */
