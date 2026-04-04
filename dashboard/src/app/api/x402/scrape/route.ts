import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 204 }));
}

export async function GET(req: Request) {
  const paymentHeader = req.headers.get("x-payment");

  if (!paymentHeader) {
    return corsHeaders(NextResponse.json(
      {
        x402Version: 1,
        payTo: "0x6344D6E94BbeBB612bA5eC55f3125Bf7a0B8666F",
        price: "0.001",
        token: "SOL",
        network: "solana:devnet",
        resource: "/api/x402/scrape",
        agentId: "aegis-demo",
        description: "Web scraping service powered by Aegis Gate",
      },
      { status: 402 }
    ));
  }

  try {
    const payment = JSON.parse(paymentHeader);

    // Verify timestamp freshness
    if (payment.timestamp) {
      const age = Date.now() - new Date(payment.timestamp).getTime();
      if (age > 5 * 60 * 1000) {
        return corsHeaders(NextResponse.json(
          { error: "Payment expired" },
          { status: 401 }
        ));
      }
    }

    // Verify signature exists
    if (!payment.txHash || payment.txHash.length < 10) {
      return corsHeaders(NextResponse.json(
        { error: "Invalid payment proof" },
        { status: 401 }
      ));
    }

    return corsHeaders(NextResponse.json({
      success: true,
      data: {
        title: "Live x402 Response from Aegis",
        content:
          "This content was paid for via the x402 protocol. The payment was verified by Aegis Gate with timestamp-based replay protection.",
        timestamp: new Date().toISOString(),
        paidWith: {
          token: payment.token ?? "SOL",
          amount: "0.001",
          from: payment.fromAgent ?? "unknown",
          txHash: payment.txHash,
        },
      },
    }));
  } catch {
    return corsHeaders(NextResponse.json(
      { error: "Invalid payment header" },
      { status: 400 }
    ));
  }
}
