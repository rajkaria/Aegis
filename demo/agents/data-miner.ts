import express from "express";
import { aegisGate, announceServices } from "@aegis-ows/gate";
import { readFileSync } from "node:fs";

const app = express();

app.get("/scrape", aegisGate({ price: "0.01", token: "USDC", agentId: "data-miner", walletAddress: "0x6344D6E94BbeBB612bA5eC55f3125Bf7a0B8666F", network: "eip155:8453" }), (req, res) => {
  const url = req.query.url as string ?? "https://example.com";
  res.json({
    agent: "data-miner",
    endpoint: "/scrape",
    data: {
      title: `Scraped: ${url}`,
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Market data shows positive trends in DeFi adoption with TVL increasing 15% month over month.",
      wordCount: 847,
      scrapedAt: new Date().toISOString(),
    }
  });
});

app.get("/health", (req, res) => { res.json({ status: "ok", agent: "data-miner" }); });

app.listen(4001, () => {
  console.log("Data Miner agent running on http://localhost:4001");
  console.log("  GET /scrape — $0.01 USDC (x402)");
  console.log("  GET /health — free");

  // Announce services via message bus (XMTP local transport)
  const config = JSON.parse(readFileSync("./agents/data-miner.config.json", "utf-8"));
  announceServices(config, "http://localhost:4001");
  console.log("  Announced services via message bus");
});
