import { NextResponse } from "next/server";
import { getEconomyOverview } from "@/lib/aegis-data";
import { getUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    const data = await getEconomyOverview(userId ?? undefined);

    // Parse pagination params for the activity array
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    const allActivity = data.activity;
    const paginatedActivity = allActivity.slice(offset, offset + limit);

    return NextResponse.json({
      ...data,
      activity: paginatedActivity,
      pagination: {
        total: allActivity.length,
        limit,
        offset,
        hasMore: offset + limit < allActivity.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read economy data" },
      { status: 500 }
    );
  }
}
