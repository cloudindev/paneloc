const { generateKeyPairSync, createPublicKey } = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' } // PEM private key OpenSSH understands immediately
});

const jwk = createPublicKey(publicKey).export({ format: 'jwk' });

// JWK uses base64url. Decode them to raw buffers.
const eBuffer = Buffer.from(jwk.e, 'base64url');
const nBuffer = Buffer.from(jwk.n, 'base64url');

// Fix if first byte has highest bit set, needs 0x00 prefix to make it positive integer in SSH format
function writeBuffer(buf) {
  if (buf[0] & 0x80) {
    const pad = Buffer.alloc(1);
    buf = Buffer.concat([pad, buf]);
  }
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(buf.length, 0);
  return Buffer.concat([lenBuf, buf]);
}

const typeStr = Buffer.from('ssh-rsa');
const typeBuf = writeBuffer(typeStr);

const sshBuffer = Buffer.concat([
  typeBuf,
  writeBuffer(eBuffer),
  writeBuffer(nBuffer)
]);

const sshPublicKey = `ssh-rsa ${sshBuffer.toString('base64')} olacloud-deploy`;

console.log('Public: ', sshPublicKey);
console.log('Private starts with:', privateKey.substring(0, 30));

// Test verification locally
fs.writeFileSync('/tmp/test_rsa.pem', privateKey);
fs.chmodSync('/tmp/test_rsa.pem', 0o600);
require('child_process').execSync('ssh-keygen -y -f /tmp/test_rsa.pem', {stdio: 'inherit'});
