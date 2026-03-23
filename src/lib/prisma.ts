import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

// Prevenir múltiples instancias de Prisma en modo desarrollo usando el scope global
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Instanciar un único Prisma Client de forma segura para Next.js
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
