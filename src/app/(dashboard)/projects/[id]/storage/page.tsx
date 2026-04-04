import React from "react"
import { prisma as db } from "@/lib/prisma"
import StorageClient from "./storage-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function StoragePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // En OLA Cloud la URL [id] equivale a un Resource (que cuelga de un Project)
  const resource = await db.resource.findUnique({
    where: { id },
    include: { project: { include: { organization: true } } }
  });

  if (!resource || !resource.project) return redirect("/projects");
  const project = resource.project;

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
