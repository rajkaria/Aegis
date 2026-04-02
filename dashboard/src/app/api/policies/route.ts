import { NextResponse } from "next/server";
import { getPolicyData } from "@/lib/aegis-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getPolicyData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read policy data" },
      { status: 500 }
    );
  }
}
