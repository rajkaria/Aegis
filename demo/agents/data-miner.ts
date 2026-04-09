import express from "express";
import { aegisGate, announceServices, initOWSWallets, getSolanaAddress, getEVMAddress } from "@aegis-ows/gate";
import { readFileSync } from "node:fs";

initOWSWallets();

const app = express();
const AGENT_ID = "data-miner";

const metrics = {
  earned: 0,
  calls: 0,
  txHistory: [] as Array<{ timestamp: string; amount: number; txHash: string; topic: string }>,
};

function aegisLog(event: Record<string, unknown>): void {
  console.log(`[AEGIS] ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}`);
}

async function fetchMarketData(topic: string): Promise<{
  prices: Record<string, { usd: number; usd_24h_change: number }>;
  tvl: Array<{ name: string; tvl: number; change_1d: number }>;
}> {
  const topicLower = topic.toLowerCase();

  const tokenMap: Record<string, string[]> = {
    defi: ["uniswap", "aave", "compound-governance-token"],
    solana: ["solana", "raydium", "jito-governance-token"],
    ethereum: ["ethereum", "lido-dao", "rocket-pool"],
    layer2: ["optimism", "arbitrum", "polygon"],
    stablecoin: ["dai", "tether", "usd-coin"],
    nft: ["apecoin", "blur", "x2y2"],
    mev: ["flashbots", "ethereum"],
    yield: ["yearn-finance", "convex-finance", "curve-dao-token"],
  };

  const matchedKey = Object.keys(tokenMap).find(k => topicLower.includes(k));
  const ids = matchedKey ? tokenMap[matchedKey] : ["bitcoin", "ethereum", "solana"];

  const [priceRes, tvlRes] = await Promise.allSettled([
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    }),
    fetch("https://api.llama.fi/protocols", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    }),
  ]);

  const prices: Record<string, { usd: number; usd_24h_change: number }> = {};
  if (priceRes.status === "fulfilled" && priceRes.value.ok) {
    const raw = await priceRes.value.json() as Record<string, { usd?: number; usd_24h_change?: number }>;
    for (const [id, data] of Object.entries(raw)) {
      prices[id] = { usd: data.usd ?? 0, usd_24h_change: data.usd_24h_change ?? 0 };
    }
  }

  const tvl: Array<{ name: string; tvl: number; change_1d: number }> = [];
  if (tvlRes.status === "fulfilled" && tvlRes.value.ok) {
    const protocols = await tvlRes.value.json() as Array<{ name: string; tvl?: number; change_1d?: number }>;
    protocols
      .filter(p => p.tvl && p.tvl > 0)
      .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
      .slice(0, 5)
      .forEach(p => tvl.push({ name: p.name, tvl: p.tvl ?? 0, change_1d: p.change_1d ?? 0 }));
  }

  return { prices, tvl };
}

app.get("/scrape", aegisGate({
  price: "0.01",
  token: "USDC",
  agentId: AGENT_ID,
  walletAddress: getEVMAddress(AGENT_ID) ?? process.env.DATA_MINER_EVM_ADDRESS ?? "0x0000000000000000000000000000000000000001",
  network: "eip155:8453",
  acceptedChains: ["eip155:8453", "solana:mainnet"],
}), async (req, res) => {
  const topic = req.query.topic as string ?? req.query.url as string ?? "DeFi";

  try {
    const data = await fetchMarketData(topic);
    const txHash = `mock-${Date.now()}`;

    metrics.earned += 0.01;
    metrics.calls += 1;
    metrics.txHistory.push({ timestamp: new Date().toISOString(), amount: 0.01, txHash, topic });

    aegisLog({ event: "earn", agentId: AGENT_ID, amount: 0.01, net: 0.01, totalEarned: metrics.earned, topic });

    res.json({
      agent: AGENT_ID,
      endpoint: "/scrape",
      topic,
      data: {
        prices: data.prices,
        topProtocolsByTvl: data.tvl,
        scrapedAt: new Date().toISOString(),
        sources: ["CoinGecko", "DeFiLlama"],
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch market data", detail: (err as Error).message });
  }
});

app.get("/metrics", (req, res) => {
  res.json({
    agent: AGENT_ID,
    earned: metrics.earned,
    calls: metrics.calls,
    netMargin: 0.01,
    solanaAddress: getSolanaAddress(AGENT_ID) ?? "not configured",
    evmAddress: getEVMAddress(AGENT_ID) ?? "not configured",
    txHistory: metrics.txHistory.slice(-20),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", agent: AGENT_ID });
});

const PORT = parseInt(process.env.PORT ?? "4001", 10);
app.listen(PORT, () => {
  console.log(`Data Miner agent running on port ${PORT}`);
  console.log("  GET /scrape   — $0.01 USDC (x402), real CoinGecko + DeFiLlama data");
  console.log("  GET /metrics  — live P&L stats");
  console.log("  GET /health   — free");

  aegisLog({ event: "startup", agentId: AGENT_ID, port: PORT });

  try {
    const config = JSON.parse(readFileSync("./agents/data-miner.config.json", "utf-8"));
    const publicUrl = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : `http://localhost:${PORT}`;
    announceServices(config, publicUrl);
    console.log(`  Announced via XMTP at ${publicUrl}`);
  } catch {
    console.log("  XMTP announce skipped (no config or transport)");
  }
});
