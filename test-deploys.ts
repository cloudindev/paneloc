import * as fs from "fs"
import * as path from "path"

async function run() {
  let envFile = ""
  try {
    envFile = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8")
  } catch (e) {
    envFile = fs.readFileSync(path.join(__dirname, ".env"), "utf8")
  }
  
  const tokenMatch = envFile.match(/COOLIFY_API_TOKEN=["']?([^"'\n]+)/)
  const urlMatch = envFile.match(/COOLIFY_API_URL=["']?([^"'\n]+)/)
  
  if(!tokenMatch || !urlMatch) {
    console.log("Could not parse env")
    return
  }
  
  let token = tokenMatch[1].trim()
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.substring(7).trim()
  }
  let url = urlMatch[1].trim()
  
  console.log("API URL:", url)
  
  // Try querying deployments
  const res = await fetch(`${url}/api/v1/deployments`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  
  if (!res.ok) {
    console.log("Failed to fetch deployments:", res.status)
    try { console.log(await res.text()) } catch {}
  } else {
    const data = await res.json()
    console.log("Deployments keys:", Object.keys(data))
    const list = Array.isArray(data) ? data : (data.data || [])
    console.log(`Found ${list.length} deployments in global history.`)
    
    if (list.length > 0) {
      console.log("Sample 0 keys:", Object.keys(list[0]))
      console.log("Sample 0 object relevant fields:")
      console.log("- uuid:", list[0].uuid)
      console.log("- application_id:", list[0].application_id)
      console.log("- status:", list[0].status)
    }
  }
}

run()
