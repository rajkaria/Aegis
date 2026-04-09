import { NextResponse } from "next/server";
import { getEconomyOverview } from "@/lib/aegis-data";
import { getUserId } from "@/lib/auth-helpers";
import { corsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  try {
    const userId = await getUserId();
    const { insights } = await getEconomyOverview(userId ?? undefined);
    return corsHeaders(NextResponse.json({ insights, generatedAt: new Date().toISOString() }));
  } catch (error) {
    return corsHeaders(NextResponse.json({ insights: [], error: "Failed to generate insights" }, { status: 500 }));
  }
}
