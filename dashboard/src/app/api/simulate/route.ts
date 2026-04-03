import { NextResponse } from "next/server";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export const dynamic = "force-dynamic";

const AEGIS_DIR = join(homedir(), ".ows", "aegis");

function readJson(file: string, fallback: any) {
  const path = join(AEGIS_DIR, file);
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return fallback; }
}

function writeJson(file: string, data: any) {
  if (!existsSync(AEGIS_DIR)) mkdirSync(AEGIS_DIR, { recursive: true });
  writeFileSync(join(AEGIS_DIR, file), JSON.stringify(data, null, 2));
}

export async function POST() {
  const now = new Date();
  const ts1 = now.toISOString();
  const ts2 = new Date(now.getTime() + 100).toISOString();

  // 1. research-buyer pays analyst $0.05
  const ledger = readJson("budget-ledger.json", { entries: [] });
  ledger.entries.push({
    timestamp: ts1,
    apiKeyId: "research-buyer",
    chainId: "eip155:8453",
    token: "USDC",
    amount: "0.05",
    tool: "http://localhost:4002/analyze",
    description: "x402 payment to analyst for /analyze",
  });

  // 2. analyst pays data-miner $0.01
  ledger.entries.push({
    timestamp: ts2,
    apiKeyId: "analyst",
    chainId: "eip155:8453",
    token: "USDC",
    amount: "0.01",
    tool: "http://localhost:4001/scrape",
    description: "x402 payment to data-miner for /scrape",
  });
  writeJson("budget-ledger.json", ledger);

  // 3. Earnings
  const earnings = readJson("earnings-ledger.json", { entries: [] });
  earnings.entries.push({
    timestamp: ts1,
    agentId: "analyst",
    endpoint: "/analyze",
    fromAgent: "research-buyer",
    token: "USDC",
    amount: "0.05",
  });
  earnings.entries.push({
    timestamp: ts2,
    agentId: "data-miner",
    endpoint: "/scrape",
    fromAgent: "analyst",
    token: "USDC",
    amount: "0.01",
  });
  writeJson("earnings-ledger.json", earnings);

  // 4. Policy log
  const policyLog = readJson("policy-log.json", { entries: [] });
  policyLog.entries.push({
    timestamp: ts1,
    policyName: "aegis-budget",
    apiKeyId: "research-buyer",
    chainId: "eip155:8453",
    allowed: true,
    reason: "Within daily budget",
  });
  policyLog.entries.push({
    timestamp: ts2,
    policyName: "aegis-guard",
    apiKeyId: "analyst",
    chainId: "eip155:8453",
    allowed: true,
    reason: "Address on allowlist",
  });
  writeJson("policy-log.json", policyLog);

  return NextResponse.json({
    success: true,
    cycle: {
      buyer_spent: "$0.05",
      analyst_earned: "$0.05",
      analyst_spent: "$0.01",
      miner_earned: "$0.01",
    },
    timestamp: ts1,
  });
}
