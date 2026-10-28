// ZEROTrace AI - Full-Stack Local Development Runner
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\x1b[36m%s\x1b[0m", "==================================================================");
console.log("\x1b[36m%s\x1b[0m", "  ZEROTrace AI — Secure Data Wiping & IT Asset Recycling Platform");
console.log("\x1b[36m%s\x1b[0m", "  Starting Full-Stack Development Services...");
console.log("\x1b[36m%s\x1b[0m", "==================================================================");

// Start Backend on Port 5000
const backendProcess = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["run", "dev"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
});

// Start Frontend on Port 8080
const frontendProcess = spawn(/^win/.test(process.platform) ? "npx.cmd" : "npx", ["vite"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  console.log("\nStopping ZEROTrace AI services...");
  backendProcess.kill();
  frontendProcess.kill();
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
