import { coolifyFetch } from "./src/app/actions/coolify"

async function run() {
  const appPayload = {
      project_uuid: "ykaj79l3ukbznszbbsi8vwhz",
      environment_name: "production",
      server_uuid: process.env.COOLIFY_SERVER_UUID || "et9epo75rfh4axrjmclq0bl5",
      git_branch: "main",
      build_pack: "nixpacks",
      ports_exposes: "3000",
      name: "test-musguilla",
      github_app_uuid: process.env.COOLIFY_GITHUB_APP_UUID,
      git_repository: "musguilla/smallcapsscreener"
  };
  
  try {
      console.log("Posting to /applications/private-github-app");
      const rDeps = await coolifyFetch("POST", "/applications/private-github-app", appPayload);
      console.log("Output:", rDeps);
  } catch(e) { console.error("Error", e.message) }
}
run();
