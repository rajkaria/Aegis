import express from "express";
import { findServices, pingAgent, sendNegotiationOffer, reportReputation, initOWSWallets, payAndFetch } from "@aegis-ows/gate";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

initOWSWallets();

const AGENT_ID = "research-buyer";
const PRICE_PER_CYCLE = 0.05;
const CYCLE_INTERVAL_MS = 10000;
const MAX_CYCLES = parseInt(process.env.MAX_CYCLES ?? "20", 10);

const ANALYST_URL = process.env.ANALYST_URL ?? "http://localhost:4002";

const RESEARCH_TOPICS = [
  "DeFi yield farming strategies",
  "Layer 2 scaling analysis",
  "Stablecoin regulation impact",
  "AI agent economy trends",
  "Cross-chain bridge security",
  "NFT market liquidity",
  "MEV protection methods",
  "Solana DeFi ecosystem",
  "Ethereum rollup comparison",
  "Web3 identity solutions",
];

const session = {
  startedAt: new Date().toISOString(),
  cycles: [] as Array<{
    cycle: number;
    topic: string;
    action: "buy" | "skip";
    reason: string;
    chain?: string;
    fee?: number;
    amount?: number;
    txHash?: string;
    result?: unknown;
  }>,
  totalSpent: 0,
  purchases: 0,
  skips: 0,
  complete: false,
};

function aegisLog(event: Record<string, unknown>): void {
  console.log(`[AEGIS] ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}`);
}

function getBudgetRemaining(): number {
  try {
    const ledgerPath = join(homedir(), ".ows", "aegis", "budget-ledger.json");
    if (!existsSync(ledgerPath)) return Infinity;
    const ledger = JSON.parse(readFileSync(ledgerPath, "utf-8"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySpend = ledger.entries
      .filter((e: any) => e.apiKeyId === AGENT_ID && new Date(e.timestamp) >= today)
      .reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);
    const configPath = join(homedir(), ".ows", "aegis", "budget-config.json");
    if (!existsSync(configPath)) return Infinity;
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    const dailyLimit = config.limits?.[0]?.daily ? parseFloat(config.limits[0].daily) : 1.0;
    return dailyLimit - todaySpend;
  } catch {
    return Infinity;
  }
}

function pickRandomTopic(): string {
  return RESEARCH_TOPICS[Math.floor(Math.random() * RESEARCH_TOPICS.length)];
}

function shouldBuy(remaining: number, price: number): { buy: boolean; reason: string } {
  if (remaining <= 0) return { buy: false, reason: "Budget exhausted" };
  if (remaining < price) return { buy: false, reason: `Insufficient budget (${remaining.toFixed(4)} < ${price})` };
  if (Math.random() < 0.15) return { buy: false, reason: "Cost optimization — skipping this cycle" };
  return { buy: true, reason: "Within budget, proceeding" };
}

async function autonomousLoop() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  AEGIS Autonomous Agent: research-buyer          ║");
  console.log("║  Mode: Cross-chain auto-routing                  ║");
  console.log("║  Using payAndFetch with chain detection           ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  for (let cycle = 1; cycle <= MAX_CYCLES; cycle++) {
    const remaining = getBudgetRemaining();
    const topic = pickRandomTopic();

    console.log(`\n── Cycle ${cycle}/${MAX_CYCLES} ──────────────────────────────`);
    console.log(`  Topic: "${topic}"`);

    aegisLog({ event: "cycle_start", cycle, topic, budgetRemaining: remaining === Infinity ? "unlimited" : remaining });

    // Discover available services
    const services = findServices("analysis", AGENT_ID);
    const service = services[0] as { price?: string; fullUrl?: string; agentId?: string } | undefined;
    const price = parseFloat(service?.price ?? String(PRICE_PER_CYCLE));
    const sellerUrl = service?.fullUrl ?? ANALYST_URL;
    const sellerAgent = service?.agentId ?? "analyst";

    // Negotiate if price is high relative to budget
    if (remaining !== Infinity && price > remaining * 0.3) {
      console.log("  Negotiating price (budget constraint)...");
      sendNegotiationOffer({
        buyerId: AGENT_ID,
        sellerId: sellerAgent,
        service: "/analyze",
        offeredPrice: (price * 0.8).toFixed(4),
        originalPrice: String(price),
        reason: "Budget constraint — requesting 20% discount",
      });
      aegisLog({ event: "negotiate", cycle, sellerAgent, offeredPrice: price * 0.8 });
    }

    const decision = shouldBuy(remaining, price);
    console.log(`  Decision: ${decision.buy ? "BUY" : "SKIP"} — ${decision.reason}`);
    aegisLog({ event: "decision", cycle, action: decision.buy ? "buy" : "skip", reason: decision.reason });

    if (!decision.buy) {
      session.cycles.push({ cycle, topic, action: "skip", reason: decision.reason });
      session.skips++;
      await sleep(CYCLE_INTERVAL_MS);
      continue;
    }

    // Execute purchase via payAndFetch (handles 402 probing, signing, retry)
    try {
      const result = await payAndFetch(
        `${sellerUrl}/analyze?topic=${encodeURIComponent(topic)}`,
        AGENT_ID
      ) as any;

      session.totalSpent += price;
      session.purchases++;

      const chain = result?.chain ?? "eip155:8453";
      const txHash = result?.txHash ?? `paid-${Date.now()}`;

      session.cycles.push({
        cycle, topic, action: "buy", reason: decision.reason,
        chain, amount: price, txHash, result: result?.analysis ?? result,
      });

      const summary = result?.analysis?.summary ?? result?.data?.title ?? "Analysis received";
      console.log(`  Purchased via ${chain} | Summary: ${String(summary).slice(0, 70)}`);
      console.log(`  Total: $${session.totalSpent.toFixed(4)} | Purchases: ${session.purchases}`);

      aegisLog({ event: "payment", cycle, chain, amount: price, txHash, topic });

      reportReputation({
        reporterId: AGENT_ID,
        aboutAgent: sellerAgent,
        rating: "positive",
        reason: "Good analysis quality",
        txHash,
      });
    } catch (err) {
      console.log(`  Purchase failed: ${(err as Error).message?.slice(0, 80)}`);
      session.cycles.push({ cycle, topic, action: "skip", reason: (err as Error).message });
      session.skips++;
    }

    await sleep(CYCLE_INTERVAL_MS);
  }

  session.complete = true;

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  Session Complete                                ║");
  console.log(`║  Purchases: ${session.purchases} | Skips: ${session.skips}`.padEnd(51) + "║");
  console.log(`║  Total spent: $${session.totalSpent.toFixed(4)}`.padEnd(51) + "║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  aegisLog({ event: "session_complete", purchases: session.purchases, skips: session.skips, totalSpent: session.totalSpent });
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

const app = express();

app.get("/run-report", (req, res) => {
  res.json(session);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", agent: AGENT_ID, complete: session.complete });
});

const PORT = parseInt(process.env.PORT ?? "4003", 10);
app.listen(PORT, () => {
  console.log(`Buyer report server on port ${PORT}`);
  console.log("  GET /run-report — full session JSON");
  console.log("  GET /health     — status");
  autonomousLoop();
});
