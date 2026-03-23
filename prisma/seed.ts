import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de la base de datos OLA CLOUD...')

  // 1. Crear Organización
  const org = await prisma.organization.upsert({
    where: { slug: 'olacloud-hq' },
    update: {},
    create: {
      name: 'OLA CLOUD HQ',
      slug: 'olacloud-hq',
      plan: 'enterprise',
    },
  })

  // 2. Crear Usuario de Prueba
  const user = await prisma.user.upsert({
    where: { email: 'admin@olacloud.es' },
    update: {},
    create: {
      email: 'admin@olacloud.es',
      name: 'Administrador OLA',
      password: 'hash_seguro_ficticio', // En un flujo real esto pasa por bcrypt/argon2
    },
  })

  // 3. Vincular Usuario a Organización (Dueño absoluto)
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: 'OWNER',
    },
  })

  // 4. Crear Proyecto de Muestra
  const project = await prisma.project.create({
    data: {
      name: 'Infraestructura Core',
      description: 'Gestión interna de panel',
      organizationId: org.id,
      status: 'active',
    },
  })

  // 5. Crear Recurso de Muestra simulado (PaaS)
  await prisma.resource.create({
    data: {
      name: 'vm101-pg-cluster',
      type: 'POSTGRES_DB',
      status: 'running',
      projectId: project.id,
      config: JSON.stringify({ ram: '4GB', vcpu: 2, ip_privada: '192.168.100.10' }),
    },
  })

  console.log('✅ Base de datos sembrada con éxito.')
  console.log('👤 Correo (Mock Admin): admin@olacloud.es')
  console.log('🏢 Organización:', org.name)
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
