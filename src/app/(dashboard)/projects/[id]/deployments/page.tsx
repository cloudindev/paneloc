import { notFound } from "next/navigation"
import { getResourceById } from "@/app/actions/projects"
import { getApplicationDeployments } from "@/app/actions/coolify"
import { DeploymentsList } from "./deployments-list"

export const dynamic = 'force-dynamic'

export default async function DeploymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resource = await getResourceById(id)

  if (!resource) {
    notFound()
  }

  const config = resource.config as any
  const coolifyUuid = config?.coolify_uuid

  let initialDeployments: any[] = []
  if (coolifyUuid) {
    const res = await getApplicationDeployments(coolifyUuid)
    if (res.success) {
      initialDeployments = res.deployments
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <DeploymentsList resource={resource} initialDeployments={initialDeployments} />
    </div>
  )
}
