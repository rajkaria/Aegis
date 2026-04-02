import express from "express";

const app = express();
app.use(express.json());

const SERVICE_WALLET = "0xSERVICE_WALLET_ADDRESS_REPLACE_ME";

// ─── GET /api/scrape ─────────────────────────────────────────────────────────
app.get("/api/scrape", (req, res) => {
  const sig = req.headers["x-payment-signature"];
  if (!sig) {
    res.status(402).setHeader(
      "x-payment",
      JSON.stringify({
        network: "eip155:1",
        token: "USDC",
        amount: "0.01",
        recipient: SERVICE_WALLET,
        resource: "/api/scrape",
      })
    );
    res.json({ error: "Payment required", price: "0.01 USDC" });
    return;
  }

  const url = (req.query["url"] as string) ?? "https://example.com";
  res.json({
    success: true,
    data: {
      url,
      title: "Scraped Page — Paid via x402",
      content: "Paid content successfully retrieved via x402 micropayment protocol.",
      wordCount: 512,
      scrapedAt: new Date().toISOString(),
    },
  });
});

// ─── GET /api/market-data ─────────────────────────────────────────────────────
app.get("/api/market-data", (req, res) => {
  const sig = req.headers["x-payment-signature"];
  if (!sig) {
    res.status(402).setHeader(
      "x-payment",
      JSON.stringify({
        network: "eip155:1",
        token: "USDC",
        amount: "0.05",
        recipient: SERVICE_WALLET,
        resource: "/api/market-data",
      })
    );
    res.json({ error: "Payment required", price: "0.05 USDC" });
    return;
  }

  const pair = (req.query["pair"] as string) ?? "ETH/USDC";
  res.json({
    success: true,
    data: {
      pair,
      price: "3412.58",
      open: "3380.00",
      high: "3450.00",
      low: "3350.00",
      close: "3412.58",
      volume: "124500.00",
      timestamp: new Date().toISOString(),
      source: "MockMarketDataFeed",
    },
  });
});

// ─── GET /api/sentiment ───────────────────────────────────────────────────────
app.get("/api/sentiment", (req, res) => {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("MPP ")) {
    res.status(402).json({
      challengeId: "sentiment-challenge",
      token: "USDC",
      amount: "0.02",
      network: "base",
    });
    return;
  }

  const asset = (req.query["asset"] as string) ?? "ETH";
  res.json({
    success: true,
    data: {
      asset,
      score: 0.72,
      label: "bullish",
      confidence: 0.88,
      sources: {
        twitter: 0.75,
        reddit: 0.68,
        telegram: 0.73,
      },
      postsAnalyzed: 4821,
      analysisWindow: "1h",
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── GET /api/audit ───────────────────────────────────────────────────────────
app.get("/api/audit", (req, res) => {
  const sig = req.headers["x-payment-signature"];
  if (!sig) {
    res.status(402).setHeader(
      "x-payment",
      JSON.stringify({
        network: "eip155:1",
        token: "USDC",
        amount: "0.10",
        recipient: SERVICE_WALLET,
        resource: "/api/audit",
      })
    );
    res.json({ error: "Payment required", price: "0.10 USDC" });
    return;
  }

  const contract = (req.query["contract"] as string) ?? "0x0000000000000000000000000000000000000000";
  res.json({
    success: true,
    data: {
      contract,
      riskScore: 0.12,
      riskLevel: "low",
      findings: [
        {
          severity: "info",
          rule: "SPDX-001",
          description: "SPDX license identifier missing",
          line: 1,
        },
      ],
      passedChecks: 42,
      failedChecks: 1,
      auditedAt: new Date().toISOString(),
      engine: "MockAuditScanner/1.0",
    },
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "mock-x402-server", version: "0.1.0" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(4020, () => {
  console.log("Mock x402 server on http://localhost:4020");
  console.log("");
  console.log("Endpoints:");
  console.log("  GET /api/scrape        → 0.01 USDC (x402, eip155:1)");
  console.log("  GET /api/market-data   → 0.05 USDC (x402, eip155:1)");
  console.log("  GET /api/sentiment     → 0.02 USDC (x402, solana:*)");
  console.log("  GET /api/audit         → 0.10 USDC (x402, eip155:1)");
  console.log("  GET /health            → health check (no payment)");
  console.log("");
  console.log("Pass header `x-payment-signature: <sig>` to simulate a paid request.");
});
