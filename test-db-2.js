const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
async function run() {
  try {
    const resources = await prisma.resource.findMany();
    console.log("Total resources", resources.length);
    resources.forEach(r => {
      const config = typeof r.config === 'string' ? JSON.parse(r.config) : r.config;
      console.log(`Resource ${r.id} (${r.type}) FQDN: ${config.custom_fqdn}`);
    });
  } catch (e) {
    console.error(e);
  }
}
run();
