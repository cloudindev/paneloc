require('dotenv').config({ path: '/Users/luis/_Dev/panel.olacloud.es/.env.local' });
async function run() {
  const token = process.env.COOLIFY_API_TOKEN;
  const baseUrl = process.env.COOLIFY_API_URL;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Accept": "application/json" };
  
  const appPayload = {"project_uuid":"ykaj79l3ukbznszbbsi8vwhz","environment_name":"production","server_uuid":"et9epo75rfh4axrjmclq0bl5","git_branch":"main","build_pack":"nixpacks","ports_exposes":"3000","name":"legalbos","github_app_uuid":"c6fp4jmvauecqsm4phdbud1z","git_repository":"cloudindev/legalbos"};
  
  try {
      console.log("Posting to", `${baseUrl}/applications/private-github-app`);
      const rDeps = await fetch(`${baseUrl}/applications/private-github-app`, { method: "POST", headers, body: JSON.stringify(appPayload) });
      console.log("Status:", rDeps.status);
      const output = await rDeps.text();
      console.log("Output:", output);
  } catch(e) { console.error("Error", e.message) }
}
run();
