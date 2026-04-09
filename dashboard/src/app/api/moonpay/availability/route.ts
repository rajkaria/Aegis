import { NextResponse } from "next/server";
import { checkMoonPayAvailability } from "@/lib/integrations/moonpay";

export const dynamic = "force-dynamic";

/** Check if MoonPay is available in the user's region */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ipAddress = searchParams.get("ip") ?? undefined;

  const availability = await checkMoonPayAvailability(ipAddress);
  return NextResponse.json(availability);
}
