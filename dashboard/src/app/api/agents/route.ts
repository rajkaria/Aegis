import { NextResponse } from "next/server";
import { getEconomyOverview } from "@/lib/aegis-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { profiles } = getEconomyOverview();
    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read agent profiles" },
      { status: 500 }
    );
  }
}
