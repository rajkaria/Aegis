import { spawn, ChildProcess } from "node:child_process";
import { createConnection } from "node:net";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function startServer(script: string, label: string): ChildProcess {
  const child = spawn("npx", ["tsx", join(__dirname, script)], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });
  child.stdout?.on("data", (data: Buffer) => console.log(`[${label}] ${data.toString().trim()}`));
  child.stderr?.on("data", (data: Buffer) => console.error(`[${label}] ${data.toString().trim()}`));
  return child;
}

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    socket.on("connect", () => { socket.destroy(); resolve(false); });
    socket.on("error", () => { resolve(true); });
    socket.setTimeout(1000, () => { socket.destroy(); resolve(true); });
  });
}

async function main() {
  console.log("Starting Aegis 3-Agent Economy Demo\n");
  console.log("Supply chain: research-buyer → analyst → data-miner\n");

  // Check for port conflicts before starting servers
  const port4001 = await isPortAvailable(4001);
  const port4002 = await isPortAvailable(4002);

  if (!port4001 || !port4002) {
    console.error("Port conflict detected:");
    if (!port4001) console.error("  Port 4001 is in use (data-miner)");
    if (!port4002) console.error("  Port 4002 is in use (analyst)");
    console.error("Kill the existing processes or use different ports.");
    process.exit(1);
  }

  // Start servers
  const miner = startServer("agents/data-miner.ts", "MINER");
  const analyst = startServer("agents/analyst.ts", "ANALYST");

  // Wait for servers to start
  console.log("Waiting for servers to start...");
  await new Promise(r => setTimeout(r, 3000));

  // Run autonomous buyer
  console.log("\nStarting autonomous-buyer...\n");
  const buyer = spawn("npx", ["tsx", join(__dirname, "agents/autonomous-buyer.ts")], {
    stdio: "inherit",
    shell: true,
  });

  buyer.on("close", (code) => {
    console.log("\nEconomy demo complete.");
    console.log("Servers still running — open http://localhost:3000 to see the dashboard.");
    console.log("Press Ctrl+C to stop.\n");
  });

  // Cleanup on exit
  process.on("SIGINT", () => {
    miner.kill();
    analyst.kill();
    process.exit(0);
  });
}

main();
