require('dotenv').config();
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

async function testAdmin() {
  const endpoint = process.env.MINIO_INTERNAL_ENDPOINT || process.env.MINIO_ENDPOINT || 'https://s3.oladc.com';
  const accessKeyId = process.env.MINIO_ROOT_USER;
  const secretAccessKey = process.env.MINIO_ROOT_PASSWORD;
  
  if (!accessKeyId) { console.log("Missing root credentials in .env"); return; }
  
  try {
    const mc = "/tmp/minio-mc";
    console.log("Setting alias...");
    await execAsync(`${mc} alias set tempalias ${endpoint} ${accessKeyId} ${secretAccessKey}`);
    console.log("Adding user testOC testSecret...");
    // mc admin user add ALIAS ACCESSKEY SECRETKEY
    await execAsync(`${mc} admin user add tempalias testOC testSecret123`);
    console.log("Attaching policy readwrite...");
    // mc admin policy attach ALIAS POLICYNAME --user ACCESSKEY
    const { stdout } = await execAsync(`${mc} admin policy attach tempalias readwrite --user testOC`);
    console.log(stdout.trim());
    
    // Testing listing users
    const users = await execAsync(`${mc} admin user list tempalias`);
    console.log("Users:", users.stdout.trim());
    
    // Cleaning up
    await execAsync(`${mc} admin user remove tempalias testOC`);
    await execAsync(`${mc} alias remove tempalias`);
    console.log("Success!");
  } catch(e) {
    console.error("Failed:", e.message);
  }
}
testAdmin();
