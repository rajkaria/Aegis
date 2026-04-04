import { payAndFetch, findServices } from "@aegis-ows/gate";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const AGENT_ID = "research-buyer";
const BUDGET_PER_CYCLE = 0.05; // Max SOL per cycle
const CYCLE_INTERVAL_MS = 10000; // 10 seconds between decisions
const MAX_CYCLES = 20;

// Decision factors the agent considers
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

function getBudgetRemaining(): number {
  try {
    const ledgerPath = join(homedir(), ".ows", "aegis", "budget-ledger.json");
    if (!existsSync(ledgerPath)) return Infinity;
    const ledger = JSON.parse(readFileSync(ledgerPath, "utf-8"));

    // Calculate today's spending
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySpend = ledger.entries
      .filter((e: any) => e.apiKeyId === AGENT_ID && new Date(e.timestamp) >= today)
      .reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);

    // Budget config
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
  // Decision logic — the agent thinks about whether to buy
  if (remaining <= 0) return { buy: false, reason: "Budget exhausted" };
  if (remaining < price) return { buy: false, reason: `Insufficient budget (${remaining.toFixed(4)} < ${price})` };
  if (Math.random() < 0.15) return { buy: false, reason: "Decided to skip this cycle (cost optimization)" };
  return { buy: true, reason: "Within budget, proceeding" };
}

async function autonomousLoop() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  AEGIS Autonomous Agent: research-buyer          ║");
  console.log("║  Mode: Autonomous decision-making                ║");
  console.log("║  Cycle interval: 10 seconds                      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  let cycle = 0;
  let totalSpent = 0;
  let purchases = 0;
  let skips = 0;

  while (cycle < MAX_CYCLES) {
    cycle++;
    const remaining = getBudgetRemaining();
    const topic = pickRandomTopic();

    console.log(`\n── Cycle ${cycle}/${MAX_CYCLES} ──────────────────────────────`);
    console.log(`  Topic: "${topic}"`);
    console.log(`  Budget remaining: ${remaining === Infinity ? "unlimited" : remaining.toFixed(4) + " SOL"}`);

    // Step 1: Discover available services
    console.log("  [1/4] Discovering services via XMTP...");
    const services = findServices("analysis", AGENT_ID);

    if (services.length === 0) {
      console.log("  [!] No services found. Waiting...");
      skips++;
      await sleep(CYCLE_INTERVAL_MS);
      continue;
    }

    const service = services[0];
    const price = parseFloat(service.price);
    console.log(`  [2/4] Found: ${service.description} at ${service.fullUrl} ($${service.price})`);

    // Step 2: Autonomous decision
    const decision = shouldBuy(remaining, price);
    console.log(`  [3/4] Decision: ${decision.buy ? "BUY" : "SKIP"} — ${decision.reason}`);

    if (!decision.buy) {
      skips++;
      await sleep(CYCLE_INTERVAL_MS);
      continue;
    }

    // Step 3: Execute purchase
    console.log(`  [4/4] Purchasing...`);
    try {
      const result = await payAndFetch(
        `${service.fullUrl}?topic=${encodeURIComponent(topic)}`,
        AGENT_ID
      ) as any;

      totalSpent += price;
      purchases++;

      const summary = result?.analysis?.summary ?? result?.data?.title ?? "Data received";
      console.log(`  Purchased! Summary: ${String(summary).slice(0, 70)}...`);
      console.log(`  Spent: ${price} SOL | Total: ${totalSpent.toFixed(4)} SOL | Purchases: ${purchases}`);
    } catch (err) {
      console.log(`  Failed: ${(err as Error).message?.slice(0, 60)}`);
      skips++;
    }

    await sleep(CYCLE_INTERVAL_MS);
  }

  // Summary
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  Session Complete                                ║");
  console.log(`║  Cycles: ${cycle} | Purchases: ${purchases} | Skips: ${skips}`.padEnd(51) + "║");
  console.log(`║  Total spent: ${totalSpent.toFixed(4)} SOL`.padEnd(51) + "║");
  console.log("║  Check dashboard: http://localhost:3000/dashboard ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

autonomousLoop();
