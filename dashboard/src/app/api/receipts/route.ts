import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { corsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

// Bundled demo receipts for Vercel
const DEMO_RECEIPTS = [
  {
    id: "rcpt-demo-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    from: "research-buyer",
    to: "analyst",
    amount: "0.005",
    token: "SOL",
    chain: "solana:devnet",
    endpoint: "/analyze",
    paymentTxHash: "JEX7PjWZLia2NpRVSZGFBUvhqP6cqXMWv5NKXHf2JjZZxkim8Ni5wuiVziNmdLwo4kBLVV7pGM1X3cnhywqb5GA",
    receiptHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    proofTxHash: "4SEWKHGxDFzXCdMmYQZyAuGd6ZJoP3SUhELsuLB2wzF3DuaTWP7fm89EVjM2wssshynfjY9CqaXtiKLdUrpjdbDn",
    status: "anchored",
  },
  {
    id: "rcpt-demo-2",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    from: "analyst",
    to: "data-miner",
    amount: "0.001",
    token: "SOL",
    chain: "solana:devnet",
    endpoint: "/scrape",
    paymentTxHash: "zBARyaWkhfedVrnXEWB9LzGCERwWfkeXm5Fk3GuFJ1fuW2JBxiUDHmHC7NQF3Jz26C9nBJAy5EFDdCkv7iLGB7V",
    receiptHash: "b2c3d4e5f678901234567890123456789012abcdef1234567890abcdef1234567",
    status: "created",
  },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  let receipts = DEMO_RECEIPTS;

  try {
    const receiptsPath = join(homedir(), ".ows", "aegis", "receipts.json");
    if (existsSync(receiptsPath)) {
      const data = JSON.parse(readFileSync(receiptsPath, "utf-8"));
      receipts = data.receipts ?? [];
    }
  } catch {}

  const paginated = receipts.slice(offset, offset + limit);

  return corsHeaders(NextResponse.json({
    receipts: paginated,
    pagination: {
      total: receipts.length,
      limit,
      offset,
      hasMore: offset + limit < receipts.length,
    },
  }));
}
