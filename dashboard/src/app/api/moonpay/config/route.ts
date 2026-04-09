import { NextResponse } from "next/server";
import { getMoonPayConfig } from "@/lib/integrations/moonpay";

export const dynamic = "force-dynamic";

/** Returns which MoonPay features are available based on env vars */
export async function GET() {
  const config = getMoonPayConfig();
  return NextResponse.json(config);
}
