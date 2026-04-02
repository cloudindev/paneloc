const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

const jwk = publicKey.export({ format: 'jwk' });

const eBuffer = Buffer.from(jwk.e, 'base64url');
const nBuffer = Buffer.from(jwk.n, 'base64url');

function writeBuffer(buf) {
  if (buf[0] & 0x80) {
    const pad = Buffer.alloc(1);
    buf = Buffer.concat([pad, buf]);
  }
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(buf.length, 0);
  return Buffer.concat([lenBuf, buf]);
}

const typeBuf = writeBuffer(Buffer.from('ssh-rsa'));
const sshBuffer = Buffer.concat([
  typeBuf,
  writeBuffer(eBuffer),
  writeBuffer(nBuffer)
]);

const sshPublicKey = `ssh-rsa ${sshBuffer.toString('base64')} olacloud-deploy`;

console.log('Public: ', sshPublicKey);
console.log('Private starts with:', privateKey.substring(0, 50));

fs.writeFileSync('/tmp/test_rsa.pem', privateKey);
fs.chmodSync('/tmp/test_rsa.pem', 0o600);
execSync('ssh-keygen -y -f /tmp/test_rsa.pem', {stdio: 'inherit'});
