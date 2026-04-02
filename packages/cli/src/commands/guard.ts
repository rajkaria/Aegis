import { Command } from "commander";
import { readGuardConfig, writeGuardConfig } from "@aegis-ows/shared";

export const guardCommand = new Command("guard")
  .description("View and manage the guard address allow/blocklist")
  .option("--add <address>", "Add an address to the allowlist (or blocklist with --block)")
  .option("--block", "When used with --add, add to the blocklist instead of allowlist")
  .option("--chain <chain>", "Chain ID to use when adding to allowlist", "eip155:1")
  .option("--remove <address>", "Remove an address from all lists")
  .action((options: { add?: string; block?: boolean; chain?: string; remove?: string }) => {
    let config = readGuardConfig();

    if (!config) {
      // Provide a sane default if not initialized
      config = { mode: "allowlist", addresses: {}, blockAddresses: [] };
    }

    // --remove
    if (options.remove) {
      const addr = options.remove.toLowerCase();
      let removed = false;

      // Remove from all allowlist chains
      for (const chain of Object.keys(config.addresses)) {
        const before = config.addresses[chain].length;
        config.addresses[chain] = config.addresses[chain].filter(
          (a) => a.toLowerCase() !== addr
        );
        if (config.addresses[chain].length < before) removed = true;
      }

      // Remove from blocklist
      if (config.blockAddresses) {
        const before = config.blockAddresses.length;
        config.blockAddresses = config.blockAddresses.filter(
          (a) => a.toLowerCase() !== addr
        );
        if (config.blockAddresses.length < before) removed = true;
      }

      writeGuardConfig(config);
      if (removed) {
        console.log(`Removed address ${options.remove} from all lists.`);
      } else {
        console.log(`Address ${options.remove} was not found in any list.`);
      }
      return;
    }

    // --add
    if (options.add) {
      const addr = options.add;

      if (options.block) {
        if (!config.blockAddresses) config.blockAddresses = [];
        if (!config.blockAddresses.includes(addr)) {
          config.blockAddresses.push(addr);
          writeGuardConfig(config);
          console.log(`Added ${addr} to blocklist.`);
        } else {
          console.log(`Address ${addr} is already in the blocklist.`);
        }
      } else {
        const chain = options.chain ?? "eip155:1";
        if (!config.addresses[chain]) config.addresses[chain] = [];
        if (!config.addresses[chain].includes(addr)) {
          config.addresses[chain].push(addr);
          writeGuardConfig(config);
          console.log(`Added ${addr} to allowlist for chain ${chain}.`);
        } else {
          console.log(`Address ${addr} is already in the allowlist for chain ${chain}.`);
        }
      }
      return;
    }

    // No flags: show current config
    console.log(`Guard Configuration`);
    console.log(`  Mode: ${config.mode}`);
    console.log();

    const chainKeys = Object.keys(config.addresses);
    if (chainKeys.length === 0) {
      console.log("  Allowlist: (empty)");
    } else {
      console.log("  Allowlist:");
      for (const chain of chainKeys) {
        const addrs = config.addresses[chain];
        if (addrs.length === 0) continue;
        console.log(`    Chain ${chain}:`);
        for (const a of addrs) {
          console.log(`      ${a}`);
        }
      }
    }

    console.log();
    const blocked = config.blockAddresses ?? [];
    if (blocked.length === 0) {
      console.log("  Blocklist: (empty)");
    } else {
      console.log("  Blocklist:");
      for (const a of blocked) {
        console.log(`    ${a}`);
      }
    }
  });
