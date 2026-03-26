import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uuid = searchParams.get('uuid')
  
  let apiUrl = process.env.COOLIFY_API_URL?.trim() || "http://127.0.0.1:8000/api/v1"
  if (apiUrl.endsWith("/")) apiUrl = apiUrl.slice(0, -1)
  if (!apiUrl.endsWith("/api/v1")) apiUrl += "/api/v1"
  
  let apiToken = process.env.COOLIFY_API_TOKEN?.trim()
  if (apiToken?.toLowerCase().startsWith("bearer ")) {
    apiToken = apiToken.substring(7).trim()
  }
  apiToken = apiToken?.replace(/^["']|["']$/g, "")

  try {
    let endpoint = `/deployments`
    if (uuid) endpoint += `?application_id=${uuid}`
    
    const res = await fetch(`${apiUrl}${endpoint}`, {
      headers: { "Authorization": `Bearer ${apiToken}` }
    })
    
    const data = await res.json()
    
    const res2 = await fetch(`${apiUrl}/applications/${uuid}/deployments`, {
      headers: { "Authorization": `Bearer ${apiToken}` }
    })
    let data2 = null
    try { data2 = await res2.json() } catch(e){}

    return NextResponse.json({ 
      global_deployments: data,
      specific_deployments: data2
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
