import { NextResponse } from "next/server";
import { getSpendingData } from "@/lib/aegis-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getSpendingData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read spending data" },
      { status: 500 }
    );
  }
}
