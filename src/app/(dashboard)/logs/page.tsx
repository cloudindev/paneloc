import { getProjectsFromDB } from "@/app/actions/projects"
import { ProjectSelector } from "@/components/layout/project-selector"

export const dynamic = 'force-dynamic'

export default async function GlobalLogsPage() {
  const projects = await getProjectsFromDB()
  
  return (
    <div className="p-8">
      <div className="mb-8 hidden">
        {/* Vercel style centers the selector, hiding the raw title. */}
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground mt-1">Visor global de eventos y runtime logs.</p>
      </div>
      <ProjectSelector title="Continue to Logs" targetPath="logs" projects={projects} />
    </div>
  )
}
