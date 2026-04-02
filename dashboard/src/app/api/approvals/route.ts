import { NextResponse } from "next/server";
import { getApprovalData } from "@/lib/aegis-data";
import { resolveApproval } from "@aegis-ows/shared";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getApprovalData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read approval data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body as { id: string; action: "approved" | "rejected" };

    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing id or action" },
        { status: 400 }
      );
    }

    if (action !== "approved" && action !== "rejected") {
      return NextResponse.json(
        { error: "Action must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const result = resolveApproval(id, action);
    if (!result) {
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to resolve approval" },
      { status: 500 }
    );
  }
}
