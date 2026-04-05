"use server"

import { prisma as db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { S3StorageProvider } from "@/lib/storage-provider"
import { encryptString, decryptString } from "@/lib/crypto"
import { createMinioUser, removeMinioUser } from "@/lib/minio-admin"

/**
 * Creates a new S3 bucket in MinIO and records it in the database.
 */
export async function createCloudBucket(projectId: string, bucketName: string, isPublic: boolean = false) {
  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { organization: true }
    });

    if (!project) throw new Error("Project not found");

    // Clean bucket name (lowercase, no spaces, valid for S3)
    const sanitizedName = bucketName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // 1. Verificar si existe en DB
    const existing = await db.storageBucket.findUnique({ where: { name: sanitizedName } });
    if (existing) throw new Error("A bucket with this name already exists");

    // 2. Crear físicamente en MinIO
    await S3StorageProvider.createBucket(sanitizedName, isPublic);

    // 3. Registrar en DB
    const bucket = await db.storageBucket.create({
      data: {
        name: sanitizedName,
        accessMode: isPublic ? "PUBLIC" : "PRIVATE",
        projectId: project.id,
        organizationId: project.organizationId,
        provider: "MINIO",
        endpoint: process.env.MINIO_ENDPOINT || "s3.oladc.com",
        region: process.env.MINIO_REGION || "eu-west-1"
      }
    });

    revalidatePath(`/projects/${projectId}/storage`);
    return { success: true, bucket };
  } catch (error: any) {
    console.error("Error in createCloudBucket:", error);
    return { success: false, error: error.message || "Failed to create bucket" };
  }
}

/**
 * Deletes a bucket physically and from DB.
 */
export async function deleteCloudBucket(bucketId: string, projectId: string) {
  try {
    const bucket = await db.storageBucket.findUnique({ where: { id: bucketId } });
    if (!bucket) throw new Error("Bucket not found");

    // TODO: Verify if bucket is empty via listObjects before deleting, or attempt delete and catch error.
    await S3StorageProvider.deleteBucket(bucket.name);

    await db.storageBucket.delete({ where: { id: bucketId } });

    revalidatePath(`/projects/${projectId}/storage`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting bucket:", error);
    return { success: false, error: error.message || "Bucket might not be empty or infrastructure error." };
  }
}

/**
 * Toggles bucket visibility block
 */
export async function toggleBucketVisibility(bucketId: string, isPublic: boolean, projectId: string) {
  try {
    const bucket = await db.storageBucket.findUnique({ where: { id: bucketId } });
    if (!bucket) throw new Error("Bucket not found");

    if (isPublic) {
      await S3StorageProvider.setBucketPublic(bucket.name);
    } else {
      await S3StorageProvider.setBucketPrivate(bucket.name);
    }

    await db.storageBucket.update({
      where: { id: bucketId },
      data: { accessMode: isPublic ? "PUBLIC" : "PRIVATE" }
    });

    revalidatePath(`/projects/${projectId}/storage`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lists the credentials for a Tenant/Organization, unmasking securely.
 * Note: Decrypting secrets to send to UI is risky, typically you only show it ONCE upon creation.
 * We will only send the encrypted string back, except for newly created keys.
 */
export async function generateTenantCredential(organizationId: string, label: string) {
  try {
    // Generamos credenciales sintéticas (16 B alfanuméricos)
    // NOTA: Para MinIO puro, esto asume que en VM103 hemos creado estos usuarios.
    // Como acordamos, crearemos la metadata aquí y si hay que enganchar un wrapper CLI de 'mc' se añadiría aquí.
    const accessKey = "OC" + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString().slice(-4);
    const secretKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Call the Admin SDK wrapper to actually provision the user in the real S3 node
    await createMinioUser(accessKey, secretKey);

    // Ciframos para guardar
    const encryptedSecret = encryptString(secretKey);

    const cred = await db.storageCredential.create({
      data: {
        organizationId,
        label,
        accessKey,
        secretKeyEncrypted: encryptedSecret,
        isActive: true
      }
    });

    // ¡OJO! Solo devolvemos el secret desencriptado ESTA vez.
    return { success: true, credential: { ...cred, plainSecret: secretKey } };
  } catch (error: any) {
    console.error("Error generating credential:", error);
    return { success: false, error: "Failed to generate credentials" };
  }
}

export async function deleteTenantCredential(id: string) {
  try {
    const cred = await db.storageCredential.findUnique({ where: { id } });
    if (!cred) throw new Error("Credential not found");

    // Borrado físico en MinIO
    await removeMinioUser(cred.accessKey);

    await db.storageCredential.delete({ where: { id } });
    return { success: true };
  } catch (e: any) {
    console.error("Error deleting credential:", e);
    return { success: false, error: e.message };
  }
}

/**
 * List objects in UI explorer
 */
export async function getBucketObjects(bucketName: string, prefix?: string) {
  try {
    const objects = await S3StorageProvider.listObjects(bucketName, prefix);
    return { success: true, objects: objects.map(o => ({
      key: o.Key,
      size: o.Size,
      lastModified: o.LastModified?.toISOString()
    }))};
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
