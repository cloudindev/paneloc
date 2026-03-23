import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('olacloud_session')?.value
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')
  const isPublicApi = pathname.startsWith('/api/health')

  // Redireccionar a login si se requiere auth
  if (!token) {
    if (!isAuthRoute && !isPublicApi && pathname !== '/favicon.ico') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } else {
    // Validar token si existe
    const payload = await verifyJWT(token)
    
    // Si el token es inválido, borrar la cookie de estado inconsistente obligando a loguear
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('olacloud_session')
      return response
    }

    // Si el usuario está validado y va a login, redirigir a dashboard (/)
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
