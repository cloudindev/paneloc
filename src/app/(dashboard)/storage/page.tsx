import React from "react"
import { prisma as db } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { ShieldAlert, HardDrive, Globe, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function GeneralStoragePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("olacloud_session")?.value
  
  if (!token) {
    return <div>No autenticado</div>
  }

  const session = await verifyJWT(token)
  if (!session || !session.sub) {
    return <div>Sesión inválida</div>
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    include: { memberships: { include: { organization: true } } }
  })

  if (!user || user.memberships.length === 0) {
    return <div>Organización no encontrada</div>
  }

  const organizationId = user.memberships[0].organizationId

  // Recopilamos todos los buckets y credenciales de la organización
  const bucketsRaw = await db.storageBucket.findMany({
    where: {
      project: {
        organizationId: organizationId
      }
    },
    include: { project: true },
    orderBy: { createdAt: "desc" }
  })

  // Recopilamos todos los Web Services para mostrar el nombre real de las aplicaciones 
  // ya que un Project ("Principal") puede contener varios recursos WEB_SERVICE.
  const appResources = await db.resource.findMany({
    where: {
      type: "WEB_SERVICE",
      project: { organizationId }
    },
    select: { id: true, name: true, projectId: true }
  })

  const buckets = bucketsRaw.map(bucket => {
    const defaultApp = appResources.find(app => app.projectId === bucket.projectId)
    return {
      ...bucket,
      uiProjectName: defaultApp?.name || bucket.project?.name || "Sin Proyecto",
      uiLinkHref: defaultApp ? `/projects/${defaultApp.id}/storage` : `/projects`
    }
  })

  const credentials = await db.storageCredential.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Object Storage</h1>
          <p className="text-muted-foreground mt-1">
            Resumen del almacenamiento compatible con S3 vinculado a tu organización.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-sm p-6 group">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{buckets.length}</h3>
          <p className="text-sm text-muted-foreground">Buckets Aprovisionados</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-sm p-6 group">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{credentials.length}</h3>
          <p className="text-sm text-muted-foreground">Claves de API S3 Activas</p>
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4 tracking-tight">Tus Buckets</h3>
      {buckets.length > 0 ? (
        <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium text-muted-foreground w-1/3">Nombre</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Proyecto Relacionado</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Acceso</th>
                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Administrar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {buckets.map((bucket) => (
                <tr key={bucket.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-3 font-medium text-foreground">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs">{bucket.name}</span>
                      <span className="text-[10px] text-muted-foreground">{bucket.endpoint}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium">
                    {bucket.uiProjectName}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center w-fit gap-1
                      ${bucket.accessMode === 'PUBLIC' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10 text-zinc-500'}`}
                    >
                      {bucket.accessMode === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {bucket.accessMode}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link 
                      href={bucket.uiLinkHref}
                      className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                    >
                      Configurar <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-muted/10 border border-dashed border-border rounded-xl p-8 text-center max-w-2xl">
          <HardDrive className="w-8 h-8 mx-auto -mt-2 text-muted-foreground mb-4 opacity-50" />
          <h4 className="text-foreground font-semibold mb-2">Aún no hay Storage configurado</h4>
          <p className="text-sm text-muted-foreground">El almacenamiento (S3) se gestiona de forma individual por cada app. Ve a uno de tus Proyectos para aprovisionar un bucket.</p>
          <div className="mt-6 flex justify-center">
            <Link href="/projects" className="bg-primary text-primary-foreground font-medium rounded-md px-4 py-2 hover:bg-primary/90 transition">
              Ver Proyectos
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
