function fixPEMFormat(raw) {
  // If it already has strict newlines, great
  if (raw.includes('\n') && !raw.includes('\\n')) return raw;
  
  // Replace literal '\n'
  let cleaned = raw.replace(/\\n/g, '\n');
  
  // If it has spaces instead of newlines after BEGIN block
  if (!cleaned.includes('\n')) {
     const beginStr = '-----BEGIN RSA PRIVATE KEY-----';
     const endStr = '-----END RSA PRIVATE KEY-----';
     const base64Content = cleaned.replace(beginStr, '').replace(endStr, '').replace(/\s+/g, '');
     
     const chunks = [];
     for(let i = 0; i < base64Content.length; i += 64) {
       chunks.push(base64Content.substring(i, i + 64));
     }
     return `${beginStr}\n${chunks.join('\n')}\n${endStr}\n`;
  }
  return cleaned;
}

const raw = "-----BEGIN RSA PRIVATE KEY----- MIIEowIBAAKCAQEAyNy7...1234 -----END RSA PRIVATE KEY-----";
console.log(fixPEMFormat(raw));
