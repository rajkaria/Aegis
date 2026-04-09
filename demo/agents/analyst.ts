import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { aegisGate, payAndFetch, announceServices, initOWSWallets, getSolanaAddress, getEVMAddress } from "@aegis-ows/gate";
import { readFileSync } from "node:fs";

initOWSWallets();

const app = express();
const AGENT_ID = "analyst";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const metrics = {
  earned: 0,
  costs: 0,
  calls: 0,
  txHistory: [] as Array<{ timestamp: string; revenue: number; cost: number; net: number; topic: string }>,
};

function aegisLog(event: Record<string, unknown>): void {
  console.log(`[AEGIS] ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}`);
}

const DATA_MINER_URL = process.env.DATA_MINER_URL ?? "http://localhost:4001";

app.get("/analyze", aegisGate({
  price: "0.05",
  token: "USDC",
  agentId: AGENT_ID,
  walletAddress: getEVMAddress(AGENT_ID) ?? process.env.ANALYST_EVM_ADDRESS ?? "0x0000000000000000000000000000000000000002",
  network: "eip155:8453",
  acceptedChains: ["eip155:8453", "solana:mainnet"],
}), async (req, res) => {
  const topic = req.query.topic as string ?? "DeFi trends";

  try {
    const scraped = await payAndFetch(
      `${DATA_MINER_URL}/scrape?topic=${encodeURIComponent(topic)}`,
      AGENT_ID
    ) as { data?: { prices?: unknown; topProtocolsByTvl?: unknown; scrapedAt?: string } };

    const minerCost = 0.01;
    const marketData = scraped.data ?? {};

    const prompt = `You are a crypto market analyst. Analyze the following market data for the topic: "${topic}".

Market Data:
${JSON.stringify(marketData, null, 2)}

Provide a concise analysis including:
1. Overall market sentiment (bullish/bearish/neutral) with confidence score 0-1
2. 2-3 key signals from the data
3. A one-sentence summary for a trading agent

Respond in JSON format:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0.0-1.0,
  "keySignals": ["signal1", "signal2"],
  "summary": "one sentence"
}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = (message.content[0] as { text: string }).text;
    let analysis: { sentiment: string; confidence: number; keySignals: string[]; summary: string };
    try {
      const match = rawText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(match?.[0] ?? rawText);
    } catch {
      analysis = {
        sentiment: "neutral",
        confidence: 0.6,
        keySignals: ["Data received from market APIs"],
        summary: rawText.slice(0, 200),
      };
    }

    const haikuCost = 0.001;
    const totalCost = minerCost + haikuCost;
    const net = 0.05 - totalCost;

    metrics.earned += 0.05;
    metrics.costs += totalCost;
    metrics.calls += 1;
    metrics.txHistory.push({
      timestamp: new Date().toISOString(),
      revenue: 0.05,
      cost: totalCost,
      net,
      topic,
    });

    aegisLog({ event: "earn", agentId: AGENT_ID, amount: 0.05, cost: totalCost, net, totalEarned: metrics.earned, topic });

    res.json({
      agent: AGENT_ID,
      endpoint: "/analyze",
      topic,
      analysis: {
        ...analysis,
        analyzedAt: new Date().toISOString(),
        dataSource: "CoinGecko + DeFiLlama via data-miner",
        model: "claude-haiku-4-5-20251001",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Analysis failed", detail: (err as Error).message });
  }
});

app.get("/metrics", (req, res) => {
  const netMargin = metrics.calls > 0 ? (metrics.earned - metrics.costs) / metrics.calls : 0.039;
  res.json({
    agent: AGENT_ID,
    earned: metrics.earned,
    costs: metrics.costs,
    calls: metrics.calls,
    netMargin,
    solanaAddress: getSolanaAddress(AGENT_ID) ?? "not configured",
    evmAddress: getEVMAddress(AGENT_ID) ?? "not configured",
    txHistory: metrics.txHistory.slice(-20),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", agent: AGENT_ID });
});

const PORT = parseInt(process.env.PORT ?? "4002", 10);
app.listen(PORT, () => {
  console.log(`Analyst agent running on port ${PORT}`);
  console.log("  GET /analyze  — $0.05 USDC (x402), real Claude Haiku analysis");
  console.log("  GET /metrics  — live P&L stats");
  console.log("  GET /health   — free");

  aegisLog({ event: "startup", agentId: AGENT_ID, port: PORT, dataMinerUrl: DATA_MINER_URL });

  try {
    const config = JSON.parse(readFileSync("./agents/analyst.config.json", "utf-8"));
    const publicUrl = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : `http://localhost:${PORT}`;
    announceServices(config, publicUrl);
    console.log(`  Announced via XMTP at ${publicUrl}`);
  } catch {
    console.log("  XMTP announce skipped (no config or transport)");
  }
});
