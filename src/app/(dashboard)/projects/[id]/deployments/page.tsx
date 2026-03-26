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
  let apiDebug = ""
  if (coolifyUuid) {
    const res = await getApplicationDeployments(coolifyUuid)
    if (res.success) {
      initialDeployments = res.deployments
      apiDebug = (res as any).debug || ""
    }
  }

  return (
    <div className="flex flex-1 h-full flex-col space-y-6">
      <DeploymentsList resource={resource} initialDeployments={initialDeployments} initialDebug={apiDebug} />
    </div>
  )
}
