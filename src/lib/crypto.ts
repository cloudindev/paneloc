/**
 * src/lib/crypto.ts
 * Utility for symmetric encryption/decryption of sensitive strings 
 * (like MinIO Secret Access Keys) before storing in PostgreSQL.
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Derives a consistent 32-byte key from the environment's ENCRYPTION_KEY.
 * Falls back to a deterministic string if not defined purely to prevent crashes,
 * but in production ENCRYPTION_KEY MUST be a 32 byte securely generated hex string.
 */
function getKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    console.warn("WARNING: ENCRYPTION_KEY is not defined in environment variables. Using a fallback key. This is INSECURE for production environments.");
    const fallback = crypto.createHash('sha256').update('insecure-fallback-key-do-not-use-in-prod').digest('base64').substring(0, 32);
    return Buffer.from(fallback, 'utf-8');
  }
  
  // Si nos dieron un hex de 32 hex chars (16 bytes), o 64 hex chars (32 bytes)...
  // Lo ideal es tener exactamente 32 bytes para aes-256. 
  // Hacemos un hash sha256 del envKey provisto para garantizar que siempre tengamos 32 bytes consistentes sin importar la longitud original.
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Cifra un texto plano y devuelve un string codificado en base64
 * con el formato: base64(iv) + ":" + base64(authTag) + ":" + base64(encryptedText)
 */
export function encryptString(text: string): string {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag().toString('base64');
  
  return `${iv.toString('base64')}:${authTag}:${encrypted}`;
}

/**
 * Descifra el string previamente generado por encryptString.
 */
export function decryptString(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.includes(':')) return encryptedPayload;
  
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted payload format');
    
    const [ivBase64, authTagBase64, encryptedTextBase64] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const key = getKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedTextBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Error decrypting string:', err);
    return '***DECRYPTION-FAILED***';
  }
}
