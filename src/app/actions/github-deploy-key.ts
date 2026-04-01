"use server"

import { execSync } from "child_process"
import { randomBytes } from "crypto"
import fs from "fs"
import path from "path"
import { App } from "octokit"
import { prisma } from "@/lib/prisma"

// We use child_process ssh-keygen because Node's crypto module doesn't natively export OpenSSH format yet
function generateSSHKey() {
  const tmpName = 'key_ola_' + randomBytes(8).toString('hex')
  const tmpPath = path.join('/tmp', tmpName)
  
  // Generate ED25519 key with no passphrase
  execSync(`ssh-keygen -t ed25519 -N "" -f ${tmpPath} -C "olacloud-deploy"`, { stdio: 'ignore' })
  
  const privateKey = fs.readFileSync(tmpPath, 'utf8')
  const publicKey = fs.readFileSync(`${tmpPath}.pub`, 'utf8')
  
  // Cleanup
  try {
    fs.unlinkSync(tmpPath)
    fs.unlinkSync(`${tmpPath}.pub`)
  } catch (e) {
    console.error("Failed to cleanup tmp ssh keys", e)
  }
  
  return { privateKey, publicKey }
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
