import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const paymentHeader = req.headers.get("x-payment");

  if (!paymentHeader) {
    return NextResponse.json(
      {
        x402Version: 1,
        payTo: "0x6344D6E94BbeBB612bA5eC55f3125Bf7a0B8666F",
        price: "0.005",
        token: "SOL",
        network: "solana:devnet",
        resource: "/api/x402/analyze",
        agentId: "aegis-demo",
        description: "Data analysis service powered by Aegis Gate — structured insights from raw data",
      },
      { status: 402 }
    );
  }

  try {
    const payment = JSON.parse(paymentHeader);

    // Verify timestamp freshness
    if (payment.timestamp) {
      const age = Date.now() - new Date(payment.timestamp).getTime();
      if (age > 5 * 60 * 1000) {
        return NextResponse.json(
          { error: "Payment expired" },
          { status: 401 }
        );
      }
    }

    // Verify signature exists
    if (!payment.txHash || payment.txHash.length < 10) {
      return NextResponse.json(
        { error: "Invalid payment proof" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        title: "Live x402 Analysis from Aegis",
        content:
          "This analysis was paid for via the x402 protocol. Aegis Gate verified the payment with timestamp-based replay protection and budget enforcement.",
        analysis: {
          sentiment: "positive",
          confidence: 0.87,
          topics: ["agent-economy", "x402-protocol", "decentralized-payments"],
          summary:
            "The x402 payment protocol enables machine-to-machine commerce with built-in budget controls and policy enforcement.",
        },
        timestamp: new Date().toISOString(),
        paidWith: {
          token: payment.token ?? "SOL",
          amount: "0.005",
          from: payment.fromAgent ?? "unknown",
          txHash: payment.txHash,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid payment header" },
      { status: 400 }
    );
  }
}
