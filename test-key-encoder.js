const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

function generateOpenSSHKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // For ed25519, SPKI DER is 44 bytes. The last 32 bytes are the actual raw key.
  const rawPublicKey = publicKey.slice(-32);

  const sshType = Buffer.from('ssh-ed25519');
  
  const typeLen = Buffer.alloc(4);
  typeLen.writeUInt32BE(sshType.length, 0);

  const keyLen = Buffer.alloc(4);
  keyLen.writeUInt32BE(rawPublicKey.length, 0);

  const sshPublicKey = Buffer.concat([typeLen, sshType, keyLen, rawPublicKey]).toString('base64');
  const OpenSSHPublicKey = `ssh-ed25519 ${sshPublicKey} olacloud-deploy`;

  return { privateKey, publicKey: OpenSSHPublicKey };
}

const keys = generateOpenSSHKeyPair();
console.log("Private:\n", keys.privateKey.substring(0, 50) + "...");
console.log("Public OpenSSH:\n", keys.publicKey);

fs.writeFileSync('/tmp/test_key.pem', keys.privateKey);
fs.chmodSync('/tmp/test_key.pem', 0o600);
console.log("\nOpenSSH verification:");
execSync('ssh-keygen -y -f /tmp/test_key.pem', {stdio: 'inherit'});
