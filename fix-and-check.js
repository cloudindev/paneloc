const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
async function run() {
  try {
    // 1. Get ALL resources with type WEB_SERVICE
    const resources = await prisma.resource.findMany({
      where: { type: "WEB_SERVICE" },
      include: { project: true }
    });
    
    console.log("Checking all WEB_SERVICE resources:");
    let found = false;
    for (const res of resources) {
      const config = typeof res.config === 'string' ? JSON.parse(res.config) : res.config;
      if (config.custom_fqdn && config.custom_fqdn.includes("noticrm.com")) {
        console.log(`FOUND in Resource ID: ${res.id}, Project: ${res.project.name}, FQDN: ${config.custom_fqdn}`);
        found = true;
        
        // Let's CLEAN IT UP so he can add it cleanly!
        let clean = config.custom_fqdn.split(',').filter(d => !d.includes("noticrm.com") && !d.includes("erwwe.com")).join(',');
        config.custom_fqdn = clean;
        await prisma.resource.update({ where: { id: res.id }, data: { config } });
        console.log(`Cleaned up this resource's string to: ${clean}`);
      }
    }
    if (!found) console.log("noticrm.com not found in ANY WEB_SERVICE!");

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
