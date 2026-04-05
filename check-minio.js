const assert = require("assert");
try {
  const Minio = require("minio");
  console.log(Object.keys(Minio));
  console.log("Client properties:", Object.getOwnPropertyNames(Minio.Client.prototype));
} catch(e) {
  console.log("Minio not installed", e.message);
}
