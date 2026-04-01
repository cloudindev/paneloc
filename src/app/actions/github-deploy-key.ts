"use server"

import { generateKeyPairSync } from "crypto"
import { App } from "octokit"

// Helper function to encode raw buffers to SSH OpenSSH standard format
function writeBuffer(buf: Buffer) {
  // If first byte has highest bit set, prepend with 0x00 to mark it as positive integer
  if (buf[0] & 0x80) {
    const pad = Buffer.alloc(1)
    buf = Buffer.concat([pad, buf])
  }
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(buf.length, 0)
  return Buffer.concat([lenBuf, buf])
}

// Emulates `ssh-keygen` purely in JavaScript, to avoid missing binaries in Docker containers like Nixpacks
function generateSSHKey() {
  // @ts-ignore: TS overload gets confused with rsa key options
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' } // Outputs: -----BEGIN RSA PRIVATE KEY-----
  })

  // Export public key to base64url JWK format to cleanly grab modulus (n) and exponent (e)
  const jwk = publicKey.export({ format: 'jwk' })

  const eBuffer = Buffer.from(jwk.e as string, 'base64url')
  const nBuffer = Buffer.from(jwk.n as string, 'base64url')

  const typeBuf = writeBuffer(Buffer.from('ssh-rsa'))
  const sshBuffer = Buffer.concat([
    typeBuf,
    writeBuffer(eBuffer),
    writeBuffer(nBuffer)
  ])

  const OpenSSHPublicKey = `ssh-rsa ${sshBuffer.toString('base64')} olacloud-deploy`
  
  return { privateKey, publicKey: OpenSSHPublicKey }
}

export async function addDeployKeyToGithubRepo(installationId: string, repoFullName: string) {
  const appId = process.env.GITHUB_APP_ID
  const privateKeyRaw = process.env.GITHUB_APP_PRIVATE_KEY

  if (!appId || !privateKeyRaw) {
    throw new Error("GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY missing in server config.")
  }

  // Parse the private key properly because it could contain escaped newlines in Vercel/Coolify env
  const formattedPrivateKey = privateKeyRaw.replace(/\\n/g, '\n')

  const app = new App({
    appId,
    privateKey: formattedPrivateKey,
  })

  // Authenticate as the specific installation for this tenant
  const octokit = await app.getInstallationOctokit(parseInt(installationId))

  const [owner, repo] = repoFullName.split('/')

  // Generate the new SSH key pair
  const { privateKey, publicKey } = generateSSHKey()

  // Inject the PUBLIC key into Github as a Deploy Key (Read Only)
  try {
    const res = await octokit.rest.repos.createDeployKey({
      owner,
      repo,
      title: `OLA Cloud Auto-Deploy Key (${new Date().toLocaleDateString()})`,
      key: publicKey,
      read_only: true, // Coolify only needs read access to pull the code
    })
    
    console.log(`Successfully added deploy key to ${repoFullName}`)
    
    return { success: true, privateKey }
  } catch (error: any) {
    console.error("Failed to add deploy key to Github:", error.message)
    throw new Error(`Failed to add Deploy Key: ${error.message}`)
  }
}
