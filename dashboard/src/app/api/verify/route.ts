import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/integrations/allium";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { txHash, chain } = (await req.json()) as {
    txHash: string;
    chain: string;
  };
  const result = await verifyTransaction(txHash, chain);
  return NextResponse.json(result);
}
