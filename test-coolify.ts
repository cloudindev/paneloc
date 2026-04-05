import { config } from "dotenv";
config();
import { coolifyFetch } from "./src/app/actions/coolify";

async function run() {
  console.log("Starting test...");
  try {
    const res = await coolifyFetch("PATCH", "/applications/o21t20rc1ju9rfocuvix64mg", { fqdn: "https://test.com" });
    console.log("fqdn SUCCESS");
  } catch (e: any) {
    console.log("fqdn ERROR:", e.message);
  }
}
run();
