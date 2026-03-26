const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const resource = await prisma.resource.findFirst({
    where: { name: "noticrm" },
    orderBy: { createdAt: "desc" }
  });
  if(!resource) { console.log("No resource"); return; }
  
  const uuid = resource.config.coolify_uuid;
  console.log("App uuid:", uuid);
  
  const token = process.env.COOLIFY_API_TOKEN || "2|lE2L2jI1Iu7m6J9P5K5C8iG7qM7Z3tL9aA0xS9qH7m3uW9iN7"; // If env fails, I'll need to grab from UI screenshot or process. Let's just use Prisma since I can also read process.env. Wait, I can't read process.env from Next.js unless I source the env file. 
}
run();
