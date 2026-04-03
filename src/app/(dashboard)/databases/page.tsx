import { GlobalDatabasesView } from "./global-databases-client"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function DatabasesPage() {
  // Fetch all databases for all projects
  // In a real multi-tenant app, we'd filter by the current team or organization
  const databases = await prisma.resource.findMany({
    where: {
      type: "POSTGRES_DB"
    },
    include: {
      project: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // Sanitize the config since it's stored as JSON
  const serialized = databases.map(db => ({
    id: db.id,
    name: db.name,
    type: db.type,
    status: db.status,
    projectId: db.projectId,
    project: db.project ? { name: db.project.name } : null,
    config: typeof db.config === 'string' ? JSON.parse(db.config) : (db.config || {})
  }))

  return <GlobalDatabasesView databases={serialized} />
}
