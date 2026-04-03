import { getProjectsFromDB } from "@/app/actions/projects"
import { ProjectSelector } from "@/components/layout/project-selector"

export const dynamic = 'force-dynamic'

export default async function GlobalDeploymentsPage() {
  const projects = await getProjectsFromDB()
  
  return (
    <div className="p-8">
      <div className="mb-8 hidden">
        {/* Hide header to match minimalist UI, or keep context but Vercel style centers the selector */}
        <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground mt-1">Historial global de despliegues.</p>
      </div>
      <ProjectSelector title="Continue to Deployments" targetPath="deployments" projects={projects} />
    </div>
  )
}
