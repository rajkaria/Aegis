import { NextResponse } from "next/server";
import { getMoonPayCurrencies } from "@/lib/integrations/moonpay";

export const dynamic = "force-dynamic";

/** Fetch supported MoonPay currencies (cached 1 hour) */
export async function GET() {
  const currencies = await getMoonPayCurrencies();
  return NextResponse.json(currencies);
}
