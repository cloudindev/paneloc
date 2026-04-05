import { exec } from "child_process"
import { promisify } from "util"
import * as os from "os"
import * as fs from "fs"
import * as path from "path"

const execAsync = promisify(exec)

/**
 * Ensures the MinIO Client (mc) is present in the system.
 * Downloads the statically linked Go binary directly from MinIO if missing.
 */
async function ensureMC(): Promise<string> {
  const mcPlatform = os.platform() === "darwin" ? "darwin" : "linux"
  const mcArch = os.arch() === "arm64" ? "arm64" : "amd64" // fallback a amd64 (x64)
  
  const mcUrl = `https://dl.min.io/client/mc/release/${mcPlatform}-${mcArch}/mc`
  const mcPath = path.join("/tmp", "minio-mc")
  
  if (!fs.existsSync(mcPath)) {
    console.log(`[Storage] Downloading MinIO Client (mc) from ${mcUrl}...`)
    try {
      await execAsync(`curl -s ${mcUrl} -o ${mcPath}`)
      await execAsync(`chmod +x ${mcPath}`)
      console.log("[Storage] MC downloaded successfully.")
    } catch (e: any) {
      console.error("[Storage] Error downloading MC:", e)
      throw new Error(`Failed to download MinIO Client: ${e.message}`)
    }
  }

  return mcPath
}

/**
 * Creates a Service Account (User) in MinIO and assigns it the standard 'readwrite' policy.
 * @param accessKey 16-char alpha-numeric key
 * @param secretKey the secret associated to the access key
 */
export async function createMinioUser(accessKey: string, secretKey: string) {
  const endpoint = process.env.MINIO_INTERNAL_ENDPOINT || process.env.MINIO_ENDPOINT || 'https://s3.oladc.com'
  const rootUser = process.env.MINIO_ROOT_USER
  const rootPass = process.env.MINIO_ROOT_PASSWORD

  if (!rootUser || !rootPass) {
    throw new Error("MINIO_ROOT_USER or MINIO_ROOT_PASSWORD not fully configured for IAM operations.")
  }

  const mc = await ensureMC()
  const alias = `oladc-${Date.now()}`

  try {
    // 1. Configurar Alias Temporal
    await execAsync(`${mc} alias set ${alias} ${endpoint} ${rootUser} ${rootPass}`)
    
    // 2. Crear el Usuario / Service Account
    await execAsync(`${mc} admin user add ${alias} ${accessKey} ${secretKey}`)
    
    // 3. Adjuntarle la Política standard 'readwrite' (acceso completo a S3)
    await execAsync(`${mc} admin policy attach ${alias} readwrite --user ${accessKey}`)
    
  } catch (error: any) {
    console.error("[Storage] Error creating MinIO user:", error)
    throw new Error(`MinIO Admin Error: ${error.message}`)
  } finally {
    // Cleanup de alias (sin esperar) para mantener la limpieza
    exec(`${mc} alias remove ${alias}`, () => {}).unref()
  }
}

/**
 * Deletes a Service Account (User) from MinIO.
 */
export async function removeMinioUser(accessKey: string) {
  const endpoint = process.env.MINIO_INTERNAL_ENDPOINT || process.env.MINIO_ENDPOINT || 'https://s3.oladc.com'
  const rootUser = process.env.MINIO_ROOT_USER
  const rootPass = process.env.MINIO_ROOT_PASSWORD

  if (!rootUser || !rootPass) {
    throw new Error("MINIO_ROOT_USER or MINIO_ROOT_PASSWORD not fully configured for IAM operations.")
  }

  const mc = await ensureMC()
  const alias = `oladc-${Date.now()}`

  try {
    await execAsync(`${mc} alias set ${alias} ${endpoint} ${rootUser} ${rootPass}`)
    await execAsync(`${mc} admin user remove ${alias} ${accessKey}`)
  } catch (error: any) {
    console.error("[Storage] Error removing MinIO user:", error)
    throw new Error(`MinIO Admin Error: ${error.message}`)
  } finally {
    exec(`${mc} alias remove ${alias}`, () => {}).unref()
  }
}
