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

  // Deduplicar bases de datos que en realidad son la misma conexión compartida (mismo UUID o nombre)
  const uniqueKeys = new Set()
  const uniqueDbList = serialized.filter(db => {
    // Si la db se llama "8927hksknotbd8" repetidas veces o comparten UUID
    const duplicateKey = db.config?.coolify_uuid || db.name
    if (uniqueKeys.has(duplicateKey)) {
      return false
    }
    uniqueKeys.add(duplicateKey)
    return true
  })

  return <GlobalDatabasesView databases={uniqueDbList} />
}
