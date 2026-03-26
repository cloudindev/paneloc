import { notFound } from "next/navigation"
import { getResourceById } from "@/app/actions/projects"
import { getApplicationDeployments } from "@/app/actions/coolify"
import { LogsTerminal } from "./logs-terminal"

export const dynamic = 'force-dynamic'

export default async function LogsPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ deployment?: string }> }) {
  const { id } = await params
  const sParams = await searchParams
  let deploymentUuid = sParams.deployment

  const resource = await getResourceById(id)

  if (!resource) {
    notFound()
  }

  const config = resource.config as any
  const coolifyUuid = config?.coolify_uuid

  // If no specific deployment is requested, we look up the latest one in the history to show the user the most recent build
  if (!deploymentUuid && coolifyUuid) {
     const resDeploys = await getApplicationDeployments(coolifyUuid)
     if (resDeploys.success && resDeploys.deployments.length > 0) {
        deploymentUuid = resDeploys.deployments[0].uuid || resDeploys.deployments[0].id
     }
  }

  return (
    <div className="flex flex-1 h-full flex-col">
      <LogsTerminal resource={resource} initialDeploymentUuid={deploymentUuid} />
    </div>
  )
}
