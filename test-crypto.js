const crypto = require('crypto');
try {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'ssh' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  console.log("Format SSH supported for RSA!", publicKey.substring(0,20));
} catch(e) { console.error(e.message) }

try {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'ssh' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  console.log("Format SSH supported for ed25519!", publicKey.substring(0,20));
} catch(e) { console.error(e.message) }

