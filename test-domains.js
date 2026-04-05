const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
async function run() {
  try {
    const p = await prisma.project.findFirst();
    console.log(p);
  } catch (e) {
    console.error("ERROR ERROR", e.message);
  }
}
run();
