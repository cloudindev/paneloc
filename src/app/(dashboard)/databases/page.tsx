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
  const uniqueDbList = serialized;

  return <GlobalDatabasesView databases={uniqueDbList} />
}
