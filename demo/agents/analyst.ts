import express from "express";
import { aegisGate, payAndFetch } from "@aegis-ows/gate";

const app = express();

app.get("/analyze", aegisGate({ price: "0.05", token: "USDC", agentId: "analyst", network: "eip155:8453" }), async (req, res) => {
  const topic = req.query.topic as string ?? "DeFi trends";

  // Buy raw data from data-miner
  const scraped = await payAndFetch("http://localhost:4001/scrape?url=data-for-" + encodeURIComponent(topic), "analyst") as any;

  // Produce analysis
  res.json({
    agent: "analyst",
    endpoint: "/analyze",
    analysis: {
      topic,
      summary: `Analysis of "${topic}": Based on scraped data, we observe strong growth patterns. Key finding: market sentiment is 72% positive with increasing adoption.`,
      sourceData: scraped.data?.title ?? "data-miner",
      confidence: 0.85,
      analyzedAt: new Date().toISOString(),
    }
  });
});

app.get("/health", (req, res) => { res.json({ status: "ok", agent: "analyst" }); });

app.listen(4002, () => {
  console.log("Analyst agent running on http://localhost:4002");
  console.log("  GET /analyze — $0.05 USDC (x402), buys from data-miner");
  console.log("  GET /health — free");
});
