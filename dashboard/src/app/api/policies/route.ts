import { NextResponse } from "next/server";
import { getPolicyData } from "@/lib/aegis-data";
import { getUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getUserId();
    const data = await getPolicyData(userId ?? undefined);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read policy data" },
      { status: 500 }
    );
  }
}
