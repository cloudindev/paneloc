import { notFound } from "next/navigation"
import { getResourceById } from "@/app/actions/projects"
import { ProjectDetailView } from "./project-detail-view"

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resource = await getResourceById(id)

  if (!resource) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4">
      <ProjectDetailView initialResource={resource} />
    </div>
  )
}
