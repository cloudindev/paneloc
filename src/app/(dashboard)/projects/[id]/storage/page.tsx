import React from "react"
import { prisma as db } from "@/lib/prisma"
import StorageClient from "./storage-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function StoragePage({ params }: { params: { id: string } }) {
  // Verificamos proyecto y tenant
  const project = await db.project.findUnique({
    where: { id: params.id },
    include: { organization: true }
  });

  if (!project) return redirect("/projects");

  // Fetch Bucket for Project (if exists)
  const bucket = await db.storageBucket.findFirst({
    where: { projectId: project.id }
  });

  // Fetch Tenant Credentials
  const credentials = await db.storageCredential.findMany({
    where: { organizationId: project.organizationId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <StorageClient 
      project={project} 
      bucket={bucket} 
      credentials={credentials} 
    />
  )
}
