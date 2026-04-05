import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function run() {
  try {
    const user = await prisma.user.findFirst()
    console.log("PRISMA WORKS:", user?.email)
  } catch(e: any) {
    console.error("PRISMA ERROR:", e.message)
  } finally {
    await prisma.$disconnect()
  }
}
run()
