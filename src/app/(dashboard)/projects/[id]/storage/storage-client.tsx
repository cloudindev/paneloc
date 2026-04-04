"use client"

import React, { useState } from "react"
import { 
  createCloudBucket, 
  deleteCloudBucket, 
  toggleBucketVisibility,
  generateTenantCredential,
  deleteTenantCredential
} from "@/app/actions/storage"
import { Loader2, HardDrive, Lock, Globe, KeyRound, Copy, CopyCheck, Trash2 } from "lucide-react"

export default function StorageClient({ project, bucket, credentials }: { project: any, bucket: any, credentials: any[] }) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<any>(null)

  const handleCreateBucket = async () => {
    setLoading(true)
    const name = `${project.slug || project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-bucket-${Math.random().toString(36).substring(2,6)}`
    
    // Mostramos estado loading, pero OLA asume que se hace con Server Action
    const res = await createCloudBucket(project.id, name, false)
    if (res?.success) alert("Bucket created successfully!")
    else alert(res?.error || "Error creating bucket")
    setLoading(false)
  }

  const handleDeleteBucket = async () => {
    if (!bucket) return
    if(!confirm("Are you sure? This will delete all files inside the bucket permanently.")) return;
    
    setLoading(true)
    const res = await deleteCloudBucket(bucket.id, project.id)
    if (res?.success) alert("Bucket deleted successfully")
    else alert(res?.error || "Error deleting bucket")
    setLoading(false)
  }

  const handleToggleVisibility = async (isPublic: boolean) => {
    if (!bucket) return
    setLoading(true)
    const res = await toggleBucketVisibility(bucket.id, isPublic, project.id)
    if (res?.success) alert("Visibility updated!")
    else alert(res?.error || "Error updating visibility")
    setLoading(false)
  }

  const handleGenerateKey = async () => {
    setLoading(true)
    const res = await generateTenantCredential(project.organizationId, `Access Key ${new Date().toLocaleDateString()}`)
    if (res?.success) {
      alert("Key generated successfully")
      setNewKey(res.credential)
    } else {
      alert(res?.error || "Error generating key")
    }
    setLoading(false)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    alert("Copied to clipboard")
  }

  if (!bucket) {
    return (
      <div className="flex flex-col h-full bg-background p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Object Storage</h1>
            <p className="text-sm text-muted-foreground mt-2">S3-Compatible Object Storage powered by MinIO. Scalable, secure, and fast.</p>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
             <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-6">
                <HardDrive className="w-8 h-8" />
             </div>
             <h2 className="text-xl font-semibold text-foreground mb-2">No Storage Bucket configured</h2>
             <p className="text-muted-foreground mb-8 max-w-md text-center text-sm">
                Attach an S3-compatible storage bucket to this project to securely store and serve objects, assets, and media files. Standard HTTP S3 API supported.
             </p>
             <button 
                onClick={handleCreateBucket}
                disabled={loading}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 px-6 py-2.5 rounded-md font-medium transition-colors flex items-center shadow-sm disabled:opacity-50"
             >
                 {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                 Provision Bucket
             </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background p-8 relative">
      {(loading) && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      <div className="max-w-4xl w-full mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Object Storage</h1>
            <p className="text-sm text-muted-foreground mt-2">Bucket details, settings and access credentials.</p>
          </div>
        </div>

        {/* Bucket Info Card */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
           <div className="p-6 border-b border-border flex justify-between items-start">
             <div>
               <h3 className="text-lg font-medium text-foreground">{bucket.name}</h3>
               <p className="text-sm text-muted-foreground mt-1">Provider: OLA MinIO • Region: {bucket.region}</p>
             </div>
             <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${bucket.accessMode === 'PUBLIC' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                  {bucket.accessMode === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {bucket.accessMode}
                </span>
             </div>
           </div>

           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">S3 Endpoint URL</span>
                  <div className="flex items-center group">
                    <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded border border-border/50 text-foreground break-all">{bucket.endpoint}</code>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bucket Name</span>
                  <div className="flex items-center group">
                    <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded border border-border/50 text-foreground break-all">{bucket.name}</code>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                 <div className="bg-muted/30 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-foreground">Visibility Mapping</span>
                   </div>
                   <p className="text-xs text-muted-foreground mb-4">
                     Public buckets allow anyone to read files via the endpoint URL. Private buckets require an S3 Access Key to read.
                   </p>
                   <div className="flex rounded-md shadow-sm">
                     <button
                       onClick={() => handleToggleVisibility(false)}
                       disabled={bucket.accessMode === "PRIVATE" || loading}
                       className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium border border-border rounded-l-md transition-colors ${
                         bucket.accessMode === "PRIVATE" ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100" : "bg-card text-muted-foreground hover:bg-muted"
                       }`}
                     >
                       <Lock className="w-4 h-4" /> Private
                     </button>
                     <button
                       onClick={() => handleToggleVisibility(true)}
                       disabled={bucket.accessMode === "PUBLIC" || loading}
                       className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium border border-l-0 border-border rounded-r-md transition-colors ${
                         bucket.accessMode === "PUBLIC" ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100" : "bg-card text-muted-foreground hover:bg-muted"
                       }`}
                     >
                       <Globe className="w-4 h-4" /> Public
                     </button>
                   </div>
                 </div>
              </div>
           </div>
           
           <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Path Style URLs are required. Direct URL pattern: <code className="mx-1">https://{bucket.endpoint}/{bucket.name}/file.png</code></span>
              <button 
                onClick={handleDeleteBucket}
                className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
               >
                 Delete Bucket
              </button>
           </div>
        </div>

        {/* Credentials Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-foreground">Access Keys</h3>
              <p className="text-sm text-muted-foreground">Manage your S3 keys for this Organization to access your buckets via SDKs.</p>
            </div>
            <button 
                onClick={handleGenerateKey}
                disabled={loading}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
             >
                 Generate Key
            </button>
          </div>

          {newKey && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-6 text-amber-900 dark:text-amber-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
               <div className="flex items-start gap-4">
                 <div className="mt-1"><KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
                 <div className="w-full">
                   <h4 className="text-base font-semibold text-amber-800 dark:text-amber-300">Save your new secret key!</h4>
                   <p className="text-sm mt-1 mb-4 text-amber-700/90 dark:text-amber-200/80">This is the only time the Secret Key will be visible. Please copy it somewhere safe.</p>
                   
                   <div className="space-y-3">
                     <div className="flex w-full items-center gap-2">
                       <span className="w-24 text-sm font-medium">Access Key</span>
                       <code className="text-sm bg-white dark:bg-black/40 px-3 flex-1 py-1.5 border border-amber-200 dark:border-amber-500/30 rounded">{newKey.accessKey}</code>
                       <button onClick={() => copyToClipboard(newKey.accessKey, 'accessK')} className="p-1.5 hover:bg-amber-200/50 dark:hover:bg-amber-500/20 rounded-md transition-colors">
                         {copied === 'accessK' ? <CopyCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                       </button>
                     </div>
                     <div className="flex w-full items-center gap-2">
                       <span className="w-24 text-sm font-medium">Secret Key</span>
                       <code className="text-sm bg-white dark:bg-black/40 px-3 flex-1 py-1.5 border border-amber-200 dark:border-amber-500/30 rounded font-mono break-all">{newKey.plainSecret}</code>
                       <button onClick={() => copyToClipboard(newKey.plainSecret, 'secretK')} className="p-1.5 hover:bg-amber-200/50 dark:hover:bg-amber-500/20 rounded-md transition-colors">
                         {copied === 'secretK' ? <CopyCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                       </button>
                     </div>
                   </div>

                   <button 
                     onClick={() => setNewKey(null)}
                     className="mt-6 text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 border border-amber-300 dark:border-amber-500/50 dark:hover:text-amber-100 hover:bg-amber-200/50 px-4 py-1.5 rounded-md transition-colors font-medium"
                   >
                     I have saved this key safely
                   </button>
                 </div>
               </div>
            </div>
          )}

          {credentials?.length > 0 ? (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
               <table className="w-full text-left text-sm">
                 <thead className="bg-muted/50 border-b border-border">
                   <tr>
                     <th className="px-6 py-3 font-medium text-muted-foreground w-1/3">Label</th>
                     <th className="px-6 py-3 font-medium text-muted-foreground">Access Key</th>
                     <th className="px-6 py-3 font-medium text-muted-foreground">Created</th>
                     <th className="px-6 py-3 font-medium text-muted-foreground text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    {credentials.map(cred => (
                      <tr key={cred.id} className="hover:bg-muted/20 transition-colors">
                         <td className="px-6 py-3 text-foreground font-medium">{cred.label}</td>
                         <td className="px-6 py-3"><code className="bg-muted/50 px-2 py-0.5 rounded border border-border/50 font-mono text-xs">{cred.accessKey}</code></td>
                         <td className="px-6 py-3 text-muted-foreground">{new Date(cred.createdAt).toLocaleDateString()}</td>
                         <td className="px-6 py-3 text-right">
                           <button 
                             onClick={async () => {
                               if(confirm("Revoke key? Applications using this will fail to authenticate.")) {
                                  await deleteTenantCredential(cred.id)
                                  window.location.reload()
                               }
                             }}
                             className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                             title="Revoke Key"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          ) : (
             <div className="bg-muted/10 border border-dashed border-border rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground">No credentials exist for this tenant yet.</p>
             </div>
          )}
        </div>

        {/* Integration Snippets */}
        <div className="space-y-4 pt-6">
           <h3 className="text-lg font-medium text-foreground">Integration Examples</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  AWS SDK v3 (Node.js)
                </div>
                <div className="p-4 bg-zinc-950 font-mono text-xs text-zinc-300 flex-1 overflow-x-auto whitespace-pre">
{`import { S3Client } from "@aws-sdk/client-s3"

const s3 = new S3Client({
  endpoint: "https://${bucket.endpoint}",
  region: "${bucket.region}",
  forcePathStyle: true, // Required
  credentials: {
    accessKeyId: "YOUR_ACCESS_KEY",
    secretAccessKey: "YOUR_SECRET_KEY"
  }
});`}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  Python (boto3)
                </div>
                <div className="p-4 bg-zinc-950 font-mono text-xs text-zinc-300 flex-1 overflow-x-auto whitespace-pre">
{`import boto3

s3 = boto3.client('s3',
    endpoint_url='https://${bucket.endpoint}',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY',
    config=boto3.session.Config(
        signature_version='s3v4'
    ),
    region_name='${bucket.region}'
)`}
                </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  )
}
