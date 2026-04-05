const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
async function run() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "luisotegui@gmail.com" }, // or similar, finding the first user
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                projects: true
              }
            }
          }
        }
      }
    });
    user.memberships.forEach(m => {
      console.log("Org:", m.organization.name, "Projects:", m.organization.projects.map(p => p.name));
    });
  } catch(e) {}
}
run();
