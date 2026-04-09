import { NextResponse } from "next/server";
import { getMoonPayTransaction } from "@/lib/integrations/moonpay";

export const dynamic = "force-dynamic";

/** Query MoonPay transaction status by external ID */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get("externalId");

  if (!externalId) {
    return NextResponse.json({ error: "externalId is required" }, { status: 400 });
  }

  const transaction = await getMoonPayTransaction(externalId);

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found or MOONPAY_SECRET_KEY not configured" },
      { status: 404 }
    );
  }

  return NextResponse.json(transaction);
}
