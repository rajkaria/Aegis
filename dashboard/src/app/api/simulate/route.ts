import { NextResponse } from "next/server";
import { addSimulatedCycle } from "@/lib/in-memory-store";

export const dynamic = "force-dynamic";

export async function POST() {
  // Try filesystem first (works locally where ~/.ows/aegis exists)
  try {
    const { existsSync, mkdirSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { homedir } = await import("node:os");
    const aegisDir = join(homedir(), ".ows", "aegis");

    if (existsSync(aegisDir)) {
      const { readFileSync, writeFileSync } = await import("node:fs");

      const now = new Date();
      const ts1 = now.toISOString();
      const ts2 = new Date(now.getTime() + 100).toISOString();

      function readJson(file: string, fallback: any) {
        const path = join(aegisDir, file);
        if (!existsSync(path)) return fallback;
        try {
          return JSON.parse(readFileSync(path, "utf-8"));
        } catch {
          return fallback;
        }
      }

      function writeJson(file: string, data: any) {
        writeFileSync(join(aegisDir, file), JSON.stringify(data, null, 2));
      }

      // research-buyer pays analyst
      const ledger = readJson("budget-ledger.json", { entries: [] });
      ledger.entries.push({
        timestamp: ts1,
        apiKeyId: "research-buyer",
        chainId: "solana:devnet",
        token: "SOL",
        amount: "0.005",
        tool: "http://localhost:4002/analyze",
        description: "x402 payment to analyst for /analyze",
        txHash: `sim-${Date.now()}-1`,
      });
      ledger.entries.push({
        timestamp: ts2,
        apiKeyId: "analyst",
        chainId: "solana:devnet",
        token: "SOL",
        amount: "0.001",
        tool: "http://localhost:4001/scrape",
        description: "x402 payment to data-miner for /scrape",
        txHash: `sim-${Date.now()}-2`,
      });
      writeJson("budget-ledger.json", ledger);

      const earnings = readJson("earnings-ledger.json", { entries: [] });
      earnings.entries.push({
        timestamp: ts1,
        agentId: "analyst",
        endpoint: "/analyze",
        fromAgent: "research-buyer",
        token: "SOL",
        amount: "0.005",
        txHash: `sim-${Date.now()}-1`,
      });
      earnings.entries.push({
        timestamp: ts2,
        agentId: "data-miner",
        endpoint: "/scrape",
        fromAgent: "analyst",
        token: "SOL",
        amount: "0.001",
        txHash: `sim-${Date.now()}-2`,
      });
      writeJson("earnings-ledger.json", earnings);

      const policyLog = readJson("policy-log.json", { entries: [] });
      policyLog.entries.push({
        timestamp: ts1,
        policyName: "aegis-budget",
        apiKeyId: "research-buyer",
        chainId: "solana:devnet",
        allowed: true,
        reason: "Within daily budget",
      });
      policyLog.entries.push({
        timestamp: ts2,
        policyName: "aegis-guard",
        apiKeyId: "analyst",
        chainId: "solana:devnet",
        allowed: true,
        reason: "Address on allowlist",
      });
      writeJson("policy-log.json", policyLog);

      return NextResponse.json({
        success: true,
        cycle: {
          buyer_spent: "0.005 SOL",
          analyst_earned: "0.005 SOL",
          analyst_spent: "0.001 SOL",
          miner_earned: "0.001 SOL",
        },
        timestamp: ts1,
      });
    }
  } catch {
    // Filesystem not available (Vercel) — fall through to in-memory store
  }

  // Vercel mode — use in-memory store
  const result = addSimulatedCycle();
  return NextResponse.json({ success: true, ...result });
}
