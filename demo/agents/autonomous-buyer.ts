import { payAndFetch, findServices, pingAgent, isAgentHealthy, sendNegotiationOffer, reportReputation } from "@aegis-ows/gate";
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

async function checkServers(): Promise<boolean> {
  const servers = [
    { name: "data-miner", url: "http://localhost:4001/health" },
    { name: "analyst", url: "http://localhost:4002/health" },
  ];

  let allUp = true;
  for (const server of servers) {
    try {
      const res = await fetch(server.url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        console.log(`  ${server.name}: online`);
      } else {
        console.error(`  ${server.name}: responded with ${res.status}`);
        allUp = false;
      }
    } catch {
      console.error(`  ${server.name}: OFFLINE — start it with: npx tsx agents/${server.name}.ts`);
      allUp = false;
    }
  }
  return allUp;
}

async function autonomousLoop() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  AEGIS Autonomous Agent: research-buyer          ║");
  console.log("║  Mode: Autonomous decision-making                ║");
  console.log("║  Cycle interval: 10 seconds                      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  console.log("Checking agent servers...");
  const serversOk = await checkServers();
  if (!serversOk) {
    console.log("\nSome servers are offline. Start them first:");
    console.log("  Terminal 1: npx tsx agents/data-miner.ts");
    console.log("  Terminal 2: npx tsx agents/analyst.ts");
    console.log("  Terminal 3: npx tsx agents/autonomous-buyer.ts");
    process.exit(1);
  }

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
    const sellerAgent = (service as any).agentId ?? "analyst";
    console.log(`  [2/6] Found: ${service.description} at ${service.fullUrl} ($${service.price})`);

    // Step 2: Health check
    console.log("  [3/6] Pinging seller for health check...");
    pingAgent(AGENT_ID, sellerAgent);
    // Note: in real XMTP this would be async with a response wait

    // Step 3: Negotiate if price is high relative to budget
    if (remaining !== Infinity && price > remaining * 0.3) {
      console.log("  [4/6] Negotiating price (budget constraint)...");
      sendNegotiationOffer({
        buyerId: AGENT_ID,
        sellerId: sellerAgent,
        service: service.endpoint,
        offeredPrice: (price * 0.8).toFixed(4),
        originalPrice: service.price,
        reason: "Budget constraint — requesting 20% discount",
      });
    } else {
      console.log("  [4/6] Price acceptable, skipping negotiation");
    }

    // Step 4: Autonomous decision
    const decision = shouldBuy(remaining, price);
    console.log(`  [5/6] Decision: ${decision.buy ? "BUY" : "SKIP"} — ${decision.reason}`);

    if (!decision.buy) {
      skips++;
      await sleep(CYCLE_INTERVAL_MS);
      continue;
    }

    // Step 5: Execute purchase
    console.log(`  [6/6] Purchasing...`);
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

      // Step 6: Report positive reputation after successful purchase
      reportReputation({
        reporterId: AGENT_ID,
        aboutAgent: sellerAgent,
        rating: "positive",
        reason: "Fast response, data quality good",
        txHash: result?.txHash,
      });
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
