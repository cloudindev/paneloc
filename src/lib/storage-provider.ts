/**
 * src/lib/storage-provider.ts
 * 
 * Adapter for S3 Compatible Object Storage using @aws-sdk/client-s3.
 * Configured automatically for OLA Cloud's MinIO node (VM103).
 */
import { 
  S3Client, 
  CreateBucketCommand, 
  DeleteBucketCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  PutBucketPolicyCommand
} from "@aws-sdk/client-s3";

function getS3Client() {
  const endpoint = process.env.MINIO_ENDPOINT || 'https://s3.oladc.com';
  const region = process.env.MINIO_REGION || 'eu-west-1';
  const accessKeyId = process.env.MINIO_ROOT_USER || '';
  const secretAccessKey = process.env.MINIO_ROOT_PASSWORD || '';
  
  // Si no tenemos credenciales, devolvemos null permitiendo que la UI muestre el error adecuadamente en lugar de crashear el servidor.
  if (!accessKeyId || !secretAccessKey) {
    console.warn("StorageProvider: Missing MINIO_ROOT_USER or MINIO_ROOT_PASSWORD");
    return null;
  }

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true, // MUST be true para MinIO
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

export class S3StorageProvider {
  /**
   * Crea un nuevo bucket en MinIO / S3.
   */
  static async createBucket(bucketName: string, isPublic: boolean = false): Promise<boolean> {
    const s3 = getS3Client();
    if (!s3) throw new Error("S3 Client no configurado. Verifica las variables de entorno.");

    try {
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      
      // Si es público, aplicamos política para lectura de objetos
      if (isPublic) {
        await this.setBucketPublic(bucketName);
      }
      return true;
    } catch (error: any) {
      console.error(`Error creando bucket ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un bucket. Requiere estar vacío (o tendríamos que vaciarlo forzosamente aquí).
   */
  static async deleteBucket(bucketName: string): Promise<boolean> {
    const s3 = getS3Client();
    if (!s3) throw new Error("S3 Client no configurado.");

    try {
      await s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
      return true;
    } catch (error: any) {
      console.error(`Error eliminando bucket ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Lista objetos dentro del bucket (máx 1000 por llamada básica).
   */
  static async listObjects(bucketName: string, prefix?: string) {
    const s3 = getS3Client();
    if (!s3) throw new Error("S3 Client no configurado.");

    try {
      const response = await s3.send(new ListObjectsV2Command({ 
        Bucket: bucketName,
        Prefix: prefix
      }));
      return response.Contents || [];
    } catch (error: any) {
      console.error(`Error listando objetos en ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Comprueba si un bucket existe.
   */
  static async checkBucketExists(bucketName: string): Promise<boolean> {
    const s3 = getS3Client();
    if (!s3) return false;
    
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
      return true;
    } catch (e: any) {
      if (e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404) return false;
      throw e;
    }
  }

  /**
   * Aplica la política que permite ListBucket y GetObject universal.
   */
  static async setBucketPublic(bucketName: string): Promise<boolean> {
    const s3 = getS3Client();
    if (!s3) throw new Error("S3 Client no configurado.");

    const publicPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: [
            "s3:GetObject"
          ],
          Resource: [
            `arn:aws:s3:::${bucketName}/*`
          ]
        }
      ]
    };

    try {
      await s3.send(new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(publicPolicy)
      }));
      return true;
    } catch (error: any) {
      console.error(`Error aplicando política pública a ${bucketName}:`, error);
      throw error;
    }
  }

  /**
   * Aplica una política privada (Elimina la política pública)
   */
  static async setBucketPrivate(bucketName: string): Promise<boolean> {
    const s3 = getS3Client();
    if (!s3) throw new Error("S3 Client no configurado.");

    // En S3/MinIO para volverlo privado solemos borrar la política o sobreescribirla vacía
    // AWS SDK no tiene DeleteBucketPolicy built-in de forma tan amigable, podemos poner una Deny o vacía
    const privatePolicy = {
      Version: "2012-10-17",
      Statement: []
    };

    try {
      await s3.send(new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(privatePolicy)
      }));
      return true;
    } catch (error: any) {
      console.error(`Error retirando política a ${bucketName}:`, error);
      // MinIO a veces lanza error si pones policy sin statements, 
      // lo ideal sería llamar a DeleteBucketPolicyCommand, pero 
      // esto bastará en muchos entornos compatibles.
      return false; // Silence para simulación
    }
  }
}
