import { NextResponse } from "next/server";
import { getMoonPaySwapUrl } from "@/lib/integrations/moonpay";

export const dynamic = "force-dynamic";

/** Generate a MoonPay swap widget URL */
export async function POST(req: Request) {
  const body = await req.json() as {
    walletAddress: string;
    fromCurrencyCode?: string;
    toCurrencyCode?: string;
  };

  const url = getMoonPaySwapUrl({
    walletAddress: body.walletAddress,
    fromCurrencyCode: body.fromCurrencyCode,
    toCurrencyCode: body.toCurrencyCode,
  });

  return NextResponse.json({ url });
}
