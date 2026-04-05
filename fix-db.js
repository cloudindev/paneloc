const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const resource = await prisma.resource.findFirst({ where: { config: { string_contains: "o21t20rc1ju9rfocuvix64mg" } } });
  if (resource) {
    let config = typeof resource.config === 'string' ? JSON.parse(resource.config) : resource.config;
    config.custom_fqdn = "";
    await prisma.resource.update({ where: { id: resource.id }, data: { config } });
    console.log("Cleared custom_fqdn in Prisma");
  } else {
    console.log("Resource not found");
  }
}
run();
