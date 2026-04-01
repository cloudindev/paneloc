import { NextResponse } from 'next/server';
import { App } from 'octokit';

export async function GET() {
  try {
    const appId = process.env.GITHUB_APP_ID;
    const privateKeyRaw = process.env.GITHUB_APP_PRIVATE_KEY || '';

    let formattedPrivateKey = privateKeyRaw.replace(/\\n/g, '\n');
    if (!formattedPrivateKey.includes('\n')) {
       const beginStr = '-----BEGIN RSA PRIVATE KEY-----';
       const endStr = '-----END RSA PRIVATE KEY-----';
       if (formattedPrivateKey.includes(beginStr) && formattedPrivateKey.includes(endStr)) {
         const base64Content = formattedPrivateKey.replace(beginStr, '').replace(endStr, '').replace(/\s+/g, '');
         const chunks = [];
         for(let i = 0; i < base64Content.length; i += 64) {
           chunks.push(base64Content.substring(i, i + 64));
         }
         formattedPrivateKey = `${beginStr}\n${chunks.join('\n')}\n${endStr}\n`;
       }
    }

    const app = new App({
      appId: appId as string,
      privateKey: formattedPrivateKey,
    });

    // Try to get an app JWT token to verify authentication with GitHub
    const { data: appData } = await app.octokit.request("GET /app");

    return NextResponse.json({ 
      status: 'success', 
      appId,
      appName: appData?.name, 
      formattedKeyLength: formattedPrivateKey.length,
      lines: formattedPrivateKey.split('\n').length
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      name: error.name,
      status_code: error.status
    }, { status: 500 });
  }
}
