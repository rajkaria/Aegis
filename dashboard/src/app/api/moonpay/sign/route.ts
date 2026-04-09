import { NextResponse } from "next/server";
import { getMoonPayBuyUrl } from "@/lib/integrations/moonpay";

export const dynamic = "force-dynamic";

/** Generate a signed MoonPay buy widget URL */
export async function POST(req: Request) {
  const body = await req.json() as {
    walletAddress: string;
    currencyCode?: string;
    baseCurrencyCode?: string;
    baseCurrencyAmount?: string;
    externalTransactionId?: string;
  };

  const url = getMoonPayBuyUrl({
    walletAddress: body.walletAddress,
    currencyCode: body.currencyCode,
    baseCurrencyCode: body.baseCurrencyCode,
    baseCurrencyAmount: body.baseCurrencyAmount,
    externalTransactionId: body.externalTransactionId,
  });

  return NextResponse.json({ url });
}
