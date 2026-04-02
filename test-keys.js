require('dotenv').config({ path: '/Users/luis/_Dev/panel.olacloud.es/.env.local' });
async function run() {
  const token = process.env.COOLIFY_API_TOKEN;
  const baseUrl = process.env.COOLIFY_API_URL || 'http://127.0.0.1:8000/api/v1';
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Accept": "application/json" };
  
  try {
      console.log("Fetching GET /security/keys");
      const rDeps = await fetch(`${baseUrl}/security/keys`, { method: "GET", headers });
      console.log("Status:", rDeps.status);
      const output = await rDeps.text();
      console.log("Output:", output);
  } catch(e) { console.error("Error", e.message) }
}
run();
