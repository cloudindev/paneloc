const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const resource = await prisma.resource.findUnique({
    where: { id: "cmn82r6ai000flp0kt0vpgb3y" }
  });
  console.log("Config:", resource?.config);
}
run();
