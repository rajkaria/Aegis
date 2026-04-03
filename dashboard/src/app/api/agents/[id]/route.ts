import { NextResponse } from "next/server";
import { getAgentDetail } from "@/lib/aegis-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getAgentDetail(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read agent detail" },
      { status: 500 }
    );
  }
}
