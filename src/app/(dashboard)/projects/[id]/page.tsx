import { notFound } from "next/navigation"
import { getResourceById } from "@/app/actions/projects"
import { ProjectDetailView } from "./project-detail-view"

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const resource = await getResourceById(params.id)

  if (!resource) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4">
      <ProjectDetailView initialResource={resource} />
    </div>
  )
}
