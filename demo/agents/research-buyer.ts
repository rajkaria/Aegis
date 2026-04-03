import { payAndFetch } from "@aegis-ows/gate";

const BUDGET = 0.50;
const PRICE_PER_CALL = 0.05;
const AGENT_ID = "research-buyer";
const TOPICS = [
  "DeFi yield farming",
  "Layer 2 scaling solutions",
  "Stablecoin regulations",
  "AI agent economies",
  "Cross-chain bridges",
];

async function main() {
  console.log(`\nResearch Buyer Agent`);
  console.log(`Budget: $${BUDGET} | Price per analysis: $${PRICE_PER_CALL}`);
  console.log("─".repeat(60));

  let spent = 0;

  for (const topic of TOPICS) {
    if (spent + PRICE_PER_CALL > BUDGET) {
      console.log(`\n  Budget exhausted: $${spent.toFixed(2)}/$${BUDGET}`);
      break;
    }

    console.log(`\n  Requesting analysis: "${topic}"...`);

    try {
      const result = await payAndFetch(
        `http://localhost:4002/analyze?topic=${encodeURIComponent(topic)}`,
        AGENT_ID
      ) as any;

      spent += PRICE_PER_CALL;
      console.log(`  Paid $${PRICE_PER_CALL} → Got: ${result.analysis?.summary?.slice(0, 80)}...`);
      console.log(`  Total spent: $${spent.toFixed(2)}/$${BUDGET}`);
    } catch (err) {
      console.error(`  Failed: ${(err as Error).message}`);
    }

    // Small delay between calls
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\n" + "─".repeat(60));
  console.log(`Done. Total spent: $${spent.toFixed(2)}`);
  console.log("Supply chain: research-buyer → analyst → data-miner");
  console.log("Check dashboard at http://localhost:3000\n");
}

main();
