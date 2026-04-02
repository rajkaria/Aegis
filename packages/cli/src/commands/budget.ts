import { Command } from "commander";
import { readBudgetConfig, readLedger, getSpentInPeriod } from "@aegis-ows/shared";

export const budgetCommand = new Command("budget")
  .description("Show budget status for all configured limits")
  .option("--chain <chain>", "Filter by chain ID")
  .option("--period <period>", "Period: daily, weekly, or monthly", "daily")
  .action((options: { chain?: string; period?: string }) => {
    const period = (options.period ?? "daily") as "daily" | "weekly" | "monthly";
    if (!["daily", "weekly", "monthly"].includes(period)) {
      console.error(`Invalid period: ${period}. Use daily, weekly, or monthly.`);
      process.exit(1);
    }

    const config = readBudgetConfig();
    if (!config) {
      console.log("No budget config found. Run `aegis init` first.");
      return;
    }

    const ledger = readLedger();

    let limits = config.limits;
    if (options.chain) {
      limits = limits.filter((l) => l.chainId === options.chain);
      if (limits.length === 0) {
        console.log(`No budget limits configured for chain: ${options.chain}`);
        return;
      }
    }

    console.log(`Budget Status — Period: ${period}`);
    console.log();

    for (const limit of limits) {
      const limitValue = limit[period];
      if (!limitValue) {
        continue;
      }

      const limitNum = parseFloat(limitValue);
      // Use a generic apiKeyId wildcard approach — sum across all api keys
      const allApiKeys = [...new Set(ledger.entries.map((e) => e.apiKeyId))];
      let totalSpent = 0;
      for (const apiKeyId of allApiKeys) {
        totalSpent += getSpentInPeriod(ledger, apiKeyId, limit.chainId, limit.token, period);
      }
      // Also sum entries that match chain+token regardless of apiKeyId via direct filter
      // getSpentInPeriod filters by apiKeyId, so we aggregate above
      const remaining = limitNum - totalSpent;
      const pct = limitNum > 0 ? ((totalSpent / limitNum) * 100).toFixed(1) : "0.0";

      console.log(`  Chain:     ${limit.chainId}`);
      console.log(`  Token:     ${limit.token}`);
      console.log(`  Limit:     ${limitValue}`);
      console.log(`  Spent:     ${totalSpent.toFixed(4)}`);
      console.log(`  Remaining: ${remaining.toFixed(4)}`);
      console.log(`  Usage:     ${pct}%`);
      console.log();
    }
  });
