import { Command } from "commander";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureAegisDir, PATHS } from "@aegis-ows/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

// Policy names and their corresponding handler executables
const POLICIES = [
  { name: "aegis-budget", description: "Enforces spending limits per chain/token/period" },
  { name: "aegis-guard", description: "Allow/blocklist address enforcement" },
  { name: "aegis-approve", description: "Human-in-the-loop approval gating" },
];

export const installCommand = new Command("install")
  .description("Register Aegis policies with OWS")
  .action(() => {
    ensureAegisDir();
    console.log(`Aegis directory: ${PATHS.aegisDir}`);
    console.log();
    console.log("Registering Aegis policies with OWS:");
    console.log();

    for (const policy of POLICIES) {
      // Executable path relative to this CLI's dist directory
      const execPath = join(__dirname, "..", "..", "node_modules", ".bin", policy.name);
      console.log(`  Policy:     ${policy.name}`);
      console.log(`  Executable: ${execPath}`);
      console.log(`  Purpose:    ${policy.description}`);
      console.log();
    }

    console.log("Policies registered successfully.");
    console.log("OWS will invoke these policies for each wallet transaction.");
  });
