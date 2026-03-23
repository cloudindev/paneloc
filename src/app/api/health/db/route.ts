import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 1. Iniciamos temporizador
    const start = Date.now()
    
    // 2. Realizamos una query ultra-ligera (puro SQL Select) para comprobar conexión con PostgreSQL (VM101)
    await prisma.$queryRaw`SELECT 1;`
    
    const latency = Date.now() - start

    // 3. Resultado existoso
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      latency_ms: latency,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
  } catch (error) {
    console.error('Database connection failed:', error)
    
    // 4. Fallo de conexión
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Verificar logs internos del servidor (VM102/Coolify)'
    }, { status: 503 })
  }
}
