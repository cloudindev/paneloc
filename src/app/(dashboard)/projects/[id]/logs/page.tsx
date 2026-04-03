import { notFound } from "next/navigation"
import { getResourceById } from "@/app/actions/projects"
import { getApplicationDeployments } from "@/app/actions/coolify"
import { LogsTerminal } from "./logs-terminal"
import { DeploymentsList } from "../deployments/deployments-list"

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

  let initialDeployments: any[] = []
  let apiDebug = ""

  if (!deploymentUuid && coolifyUuid) {
     const resDeploys = await getApplicationDeployments(coolifyUuid)
     if (resDeploys.success) {
        initialDeployments = resDeploys.deployments
        apiDebug = (resDeploys as any).debug || ""
     }
  }

  return (
    <div className="flex flex-1 h-full flex-col space-y-6">
      {deploymentUuid ? (
        <LogsTerminal resource={resource} initialDeploymentUuid={deploymentUuid} />
      ) : (
        <DeploymentsList resource={resource} initialDeployments={initialDeployments} initialDebug={apiDebug} />
      )}
    </div>
  )
}
