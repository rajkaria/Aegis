import { NextResponse } from "next/server";
import { getServiceData } from "@/lib/aegis-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getServiceData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read service data" },
      { status: 500 }
    );
  }
}
