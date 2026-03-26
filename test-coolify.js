require("dotenv").config({path: ".env"});
const fetch = require("node-fetch");

async function run() {
  const url = process.env.COOLIFY_API_URL;
  const token = process.env.COOLIFY_API_TOKEN;
  
  if(!url || !token) { console.log("Missing env"); return; }
  
  const appsRes = await fetch(`${url}/api/v1/applications`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const apps = await appsRes.json();
  if(!apps || apps.length === 0) { console.log("No apps"); return; }
  
  const uuid = apps[0].uuid;
  console.log("App uuid:", uuid);
  
  const depRes = await fetch(`${url}/api/v1/applications/${uuid}/deployments`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const text = await depRes.text();
  console.log("Deployments raw text:");
  console.log(text.substring(0, 1000));
}
run();
