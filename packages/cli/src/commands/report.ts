import { Command } from "commander";
import { readLedger } from "@aegis-ows/shared";
import type { LedgerEntry } from "@aegis-ows/shared";

function getEntriesForPeriod(entries: LedgerEntry[], period: string): LedgerEntry[] {
  const now = new Date();
  let cutoff: Date;

  switch (period) {
    case "today": {
      cutoff = new Date(now);
      cutoff.setHours(0, 0, 0, 0);
      break;
    }
    case "week": {
      cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
      break;
    }
    case "month": {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "all":
    default:
      return entries;
  }

  return entries.filter((e) => new Date(e.timestamp) >= cutoff);
}

function formatSummary(entries: LedgerEntry[]): void {
  if (entries.length === 0) {
    console.log("No transactions in this period.");
    return;
  }

  // Total spending
  const total = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  console.log(`Total transactions: ${entries.length}`);
  console.log(`Total spending:     ${total.toFixed(6)}`);
  console.log();

  // Breakdown by chain
  const byChain: Record<string, Record<string, number>> = {};
  for (const e of entries) {
    if (!byChain[e.chainId]) byChain[e.chainId] = {};
    if (!byChain[e.chainId][e.token]) byChain[e.chainId][e.token] = 0;
    byChain[e.chainId][e.token] += parseFloat(e.amount);
  }

  console.log("Breakdown by chain:");
  for (const chain of Object.keys(byChain)) {
    console.log(`  ${chain}:`);
    for (const token of Object.keys(byChain[chain])) {
      console.log(`    ${token}: ${byChain[chain][token].toFixed(6)}`);
    }
  }
}

function formatDetailed(entries: LedgerEntry[]): void {
  if (entries.length === 0) {
    console.log("No transactions in this period.");
    return;
  }

  console.log(`Transactions (${entries.length}):`);
  console.log();
  for (const e of entries) {
    console.log(`  Timestamp: ${e.timestamp}`);
    console.log(`  API Key:   ${e.apiKeyId}`);
    console.log(`  Chain:     ${e.chainId}`);
    console.log(`  Token:     ${e.token}`);
    console.log(`  Amount:    ${e.amount}`);
    if (e.txHash) console.log(`  TxHash:    ${e.txHash}`);
    if (e.tool) console.log(`  Tool:      ${e.tool}`);
    if (e.description) console.log(`  Notes:     ${e.description}`);
    console.log();
  }
}

function formatCSV(entries: LedgerEntry[]): void {
  console.log("timestamp,apiKeyId,chainId,token,amount,txHash,tool,description");
  for (const e of entries) {
    const row = [
      e.timestamp,
      e.apiKeyId,
      e.chainId,
      e.token,
      e.amount,
      e.txHash ?? "",
      e.tool ?? "",
      e.description ? `"${e.description.replace(/"/g, '""')}"` : "",
    ].join(",");
    console.log(row);
  }
}

export const reportCommand = new Command("report")
  .description("Generate a spending report from the ledger")
  .option("--period <period>", "Period: today, week, month, or all", "today")
  .option("--format <format>", "Output format: summary, detailed, or csv", "summary")
  .action((options: { period?: string; format?: string }) => {
    const period = options.period ?? "today";
    const format = options.format ?? "summary";

    const validPeriods = ["today", "week", "month", "all"];
    const validFormats = ["summary", "detailed", "csv"];

    if (!validPeriods.includes(period)) {
      console.error(`Invalid period: ${period}. Use: ${validPeriods.join(", ")}`);
      process.exit(1);
    }
    if (!validFormats.includes(format)) {
      console.error(`Invalid format: ${format}. Use: ${validFormats.join(", ")}`);
      process.exit(1);
    }

    const ledger = readLedger();
    const entries = getEntriesForPeriod(ledger.entries, period);

    if (format !== "csv") {
      console.log(`Report — Period: ${period}, Format: ${format}`);
      console.log();
    }

    switch (format) {
      case "summary":
        formatSummary(entries);
        break;
      case "detailed":
        formatDetailed(entries);
        break;
      case "csv":
        formatCSV(entries);
        break;
    }
  });
