import { loginAction } from '@/app/actions/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const formData = new FormData()
    formData.append('email', 'admin@olacloud.es')
    formData.append('password', 'hash_seguro_ficticio')

    const result = await loginAction(null, formData)
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message, 
      stack: error.stack 
    }, { status: 500 })
  }
}
