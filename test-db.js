const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
async function run() {
  const resources = await prisma.resource.findMany({ select: { id: true, type: true, config: true, project: { select: { id: true, name: true } } }});
  resources.forEach(r => {
    const config = typeof r.config === 'string' ? JSON.parse(r.config) : r.config;
    if (config?.custom_fqdn) {
      console.log(`Resource ${r.id} (${r.type}) Project ${r.project.name} FQDN: ${config.custom_fqdn}`);
    }
  });
}
run();
