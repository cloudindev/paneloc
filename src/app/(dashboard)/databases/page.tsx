import { GlobalDatabasesView } from "./global-databases-client"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function DatabasesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("olacloud_session")?.value
  if (!token) throw new Error("Unauthorized")

  const session = await verifyJWT(token)
  if (!session || !session.sub) throw new Error("Unauthorized")

  const databases = await prisma.resource.findMany({
    where: {
      type: "POSTGRES_DB",
      project: {
        organization: {
          members: {
            some: {
              userId: session.sub
            }
          }
        }
      }
    },
    include: {
      project: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // Fetch all app resources to resolve linked_app names
  const allApps = await prisma.resource.findMany({
    where: { type: "WEB_SERVICE" },
    select: { id: true, name: true }
  })
  const appMap = new Map(allApps.map(a => [a.id, a.name]))

  // Sanitize the config since it's stored as JSON
  const serialized = databases.map(db => {
    const config = typeof db.config === 'string' ? JSON.parse(db.config) : (db.config || {})
    const linkedAppId = config.linked_app
    const linkedAppName = linkedAppId ? appMap.get(linkedAppId) : null

    return {
      id: db.id,
      name: db.name,
      type: db.type,
      status: db.status,
      projectId: linkedAppId || db.projectId,
      project: { name: linkedAppName || (db.project ? db.project.name : "Desconocido") },
      config
    }
  })

  // Deduplicar bases de datos que en realidad son la misma conexión compartida (mismo UUID o nombre)
  const uniqueDbList = serialized;

  return <GlobalDatabasesView databases={uniqueDbList} />
}
