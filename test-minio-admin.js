const { exec } = require("child_process");
const { promisify } = require("util");
const os = require("os");
const fs = require("fs");
const path = require("path");

const execAsync = promisify(exec);

async function downloadMC() {
  const platform = os.platform();
  const arch = os.arch();
  
  let mcPlatform = "linux";
  if (platform === "darwin") mcPlatform = "darwin";
  
  let mcArch = "amd64"; // x64
  if (arch === "arm64") mcArch = "arm64";
  
  const mcUrl = `https://dl.min.io/client/mc/release/${mcPlatform}-${mcArch}/mc`;
  const mcPath = path.join("/tmp", "minio-mc");
  
  if (!fs.existsSync(mcPath)) {
    console.log(`Downloading mc from ${mcUrl}...`);
    await execAsync(`curl -s ${mcUrl} -o ${mcPath}`);
    await execAsync(`chmod +x ${mcPath}`);
  }
  return mcPath;
}

async function test() {
  try {
    const mcPath = await downloadMC();
    console.log("mc installed at:", mcPath);
    const { stdout } = await execAsync(`${mcPath} --version`);
    console.log("MC Version:", stdout.trim());
  } catch (e) {
    console.error("Test failed", e);
  }
}
test();
