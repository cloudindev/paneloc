import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const dbs = await prisma.resource.findMany({ where: { type: "POSTGRES_DB" } })
  console.log(JSON.stringify(dbs, null, 2))
}
main()
