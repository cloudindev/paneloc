const fs = require('fs');

async function test() {
  let envFile = "";
  try { envFile = fs.readFileSync(".env.local", "utf8"); } catch(e) { envFile = fs.readFileSync(".env", "utf8"); }
  const urlMatch = envFile.match(/COOLIFY_API_URL=["']?([^"'\n]+)/);
  const tokenMatch = envFile.match(/COOLIFY_API_TOKEN=["']?([^"'\n]+)/);
  let url = urlMatch[1].trim();
  if(url.endsWith("/")) url = url.slice(0, -1);
  if(!url.endsWith("/api/v1")) url += "/api/v1";
  let token = tokenMatch[1].trim();
  if(token.toLowerCase().startsWith("bearer ")) token = token.substring(7).trim();

  // Test deployments endpoint directly
  const res = await fetch(`${url}/deployments`, { headers: { "Authorization": `Bearer ${token}` } });
  const data = await res.json();
  fs.writeFileSync("/tmp/coolify-test.json", JSON.stringify(data, null, 2));
  console.log("Written to /tmp/coolify-test.json! Length:", data.length || data.data?.length);
}
test().catch(console.error);
