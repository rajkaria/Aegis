import { NextResponse } from "next/server";
import { getMoonPaySellUrl } from "@/lib/integrations/moonpay";

export const dynamic = "force-dynamic";

/** Generate a signed MoonPay sell widget URL for off-ramping */
export async function POST(req: Request) {
  const body = await req.json() as {
    walletAddress: string;
    currencyCode?: string;
    baseCurrencyCode?: string;
    quoteCurrencyAmount?: string;
    externalTransactionId?: string;
  };

  const url = getMoonPaySellUrl({
    walletAddress: body.walletAddress,
    currencyCode: body.currencyCode,
    baseCurrencyCode: body.baseCurrencyCode,
    quoteCurrencyAmount: body.quoteCurrencyAmount,
    externalTransactionId: body.externalTransactionId,
  });

  return NextResponse.json({ url });
}
