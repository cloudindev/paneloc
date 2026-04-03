import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function run() {
  const token = process.env.COOLIFY_API_TOKEN
  const url = `${process.env.COOLIFY_API_URL}/api/v1/applications`
  
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }})
  const apps = await res.json()
  const app = apps.find(a => a.name === 'legalbos')
  if (!app) return console.log('not found limit')
  
  const envsRes = await fetch(`${url}/${app.uuid}/envs`, { headers: { Authorization: `Bearer ${token}` }})
  const envs = await envsRes.json()
  console.log(envs.map(e => `${e.key} = ${e.value} (${e.uuid})`))
}
run()
