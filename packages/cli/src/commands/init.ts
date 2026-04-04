import { Command } from "commander";
import { existsSync } from "node:fs";
import {
  PATHS,
  ensureAegisDir,
  writeBudgetConfig,
  writeGuardConfig,
  writeDeadswitchConfig,
} from "@aegis-ows/shared";

export const initCommand = new Command("init")
  .description("Initialize Aegis configuration directory and default config files")
  .action(() => {
    ensureAegisDir();
    console.log(`Initialized directory: ${PATHS.aegisDir}`);

    const created: string[] = [];

    // Default budget config: $100/day global
    if (!existsSync(PATHS.budgetConfig)) {
      writeBudgetConfig({
        limits: [
          {
            chainId: "eip155:1",
            token: "ETH",
            daily: "100",
          },
        ],
      });
      created.push(PATHS.budgetConfig);
    }

    // Default guard config: allowlist mode
    if (!existsSync(PATHS.guardConfig)) {
      writeGuardConfig({
        mode: "allowlist",
        addresses: {},
        blockAddresses: [],
      });
      created.push(PATHS.guardConfig);
    }

    // Default deadswitch config: 30 min inactivity trigger
    if (!existsSync(PATHS.deadswitchConfig)) {
      writeDeadswitchConfig({
        maxInactiveMinutes: 30,
        onTrigger: "revoke_key",
        sweepFunds: false,
        enabled: true,
      });
      console.log("Created deadswitch config (30 min inactivity trigger)");
      created.push(PATHS.deadswitchConfig);
    }

    if (created.length === 0) {
      console.log("All config files already exist — nothing to create.");
    } else {
      console.log("Created default config files:");
      for (const f of created) {
        console.log(`  ${f}`);
      }
    }

    console.log("\nOptional: Set AEGIS_WEBHOOK_URL to receive alerts on policy blocks");
    console.log("  export AEGIS_WEBHOOK_URL=https://your-slack-webhook.com/...");
  });
