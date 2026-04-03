import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('olacloud_session')?.value
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')
  const isPublicApi = pathname.startsWith('/api/health') || pathname.startsWith('/api/debug') || pathname.startsWith('/api/webhooks')

  if (!token) {
    // Si no hay token y no es ruta pública, forzar login
    if (!isAuthRoute && !isPublicApi && pathname !== '/favicon.ico') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Si hay token, validarlo criptográficamente
  const payload = await verifyJWT(token)

  if (!payload) {
    // Si es inválido (caducado o falso), destruimos la cookie transparentemente
    // Si iba a una ruta privida lo mandamos a login. Si ya iba a login, le dejamos pasar sin la cookie.
    if (!isAuthRoute && !isPublicApi && pathname !== '/favicon.ico') {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('olacloud_session')
      return response
    }
    const response = NextResponse.next()
    response.cookies.delete('olacloud_session')
    return response
  }

  // Si el token es VÁLIDO y trata de entrar a Auth, mandarlo al Panel
  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
