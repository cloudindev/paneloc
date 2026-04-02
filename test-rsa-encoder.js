const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

function generateRSAKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    // ssh-keygen supports PKCS1
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
  });

  // But we need the PUBLIC key in OpenSSH format for GitHub.
  // Actually, wait, node 15+ has format: 'ssh' for public keys! Let's try!
  
}
