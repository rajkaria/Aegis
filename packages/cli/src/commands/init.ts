import { Command } from "commander";
import { existsSync, mkdirSync } from "node:fs";
import {
  PATHS,
  ensureAegisDir,
  writeBudgetConfig,
  writeGuardConfig,
  writeApproveConfig,
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

    // Default approve config: auto < $1, hard block > $100
    if (!existsSync(PATHS.approveConfig)) {
      writeApproveConfig({
        thresholds: {
          auto_approve_below: "1",
          require_approval_above: "1",
          hard_block_above: "100",
        },
        approval_ttl_minutes: 30,
      });
      created.push(PATHS.approveConfig);
    }

    if (created.length === 0) {
      console.log("All config files already exist — nothing to create.");
    } else {
      console.log("Created default config files:");
      for (const f of created) {
        console.log(`  ${f}`);
      }
    }
  });
