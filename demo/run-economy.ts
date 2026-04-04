import { spawn, ChildProcess } from "node:child_process";
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

async function main() {
  console.log("Starting Aegis 3-Agent Economy Demo\n");
  console.log("Supply chain: research-buyer → analyst → data-miner\n");

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
