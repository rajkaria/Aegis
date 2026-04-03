import { NextResponse } from "next/server";
import { getEconomyOverview } from "@/lib/aegis-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getEconomyOverview();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read economy data" },
      { status: 500 }
    );
  }
}
