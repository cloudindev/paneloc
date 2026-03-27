const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function run() {
  console.log("STARTING TEST SCRIPT...");
  try {
    const prisma = new PrismaClient();
    console.log("Connecting DB...");
    const resource = await prisma.resource.findUnique({
      where: { id: "cmn82r6ai000flp0kt0vpgb3y" }
    });
    console.log("Resource found:", resource ? "Yes" : "No");
    if(!resource) return;
    
    const uuid = resource.config.coolify_uuid;
    console.log("Coolify App uuid:", uuid);
    
    let envFile = "";
    try { envFile = fs.readFileSync(".env.local", "utf8"); } catch(e) { envFile = fs.readFileSync(".env", "utf8"); }
    
    const urlMatch = envFile.match(/COOLIFY_API_URL=["']?([^"'\n]+)/);
    const tokenMatch = envFile.match(/COOLIFY_API_TOKEN=["']?([^"'\n]+)/);
    
    if(!urlMatch || !tokenMatch) { console.log("No env"); return; }
    let url = urlMatch[1].trim();
    if(url.endsWith("/")) url = url.slice(0, -1);
    if(!url.endsWith("/api/v1")) url += "/api/v1";
    
    let token = tokenMatch[1].trim();
    if(token.toLowerCase().startsWith("bearer ")) token = token.substring(7).trim();
    
    console.log("API URL:", url);
    console.log("Testing endpoints...");
    
    const res = await fetch(`${url}/deployments?application_id=${uuid}`, { headers: { "Authorization": `Bearer ${token}` } });
    let data = null;
    try { data = await res.json(); } catch(e) { data = await res.text(); }
    console.log("1. /deployments?application_id=:uuid :", typeof data, Array.isArray(data));
    console.log(JSON.stringify(data).slice(0, 500));
    
  } catch(e) { console.error(e) }
  console.log("DONE TEST SCRIPT.");
}
run();
