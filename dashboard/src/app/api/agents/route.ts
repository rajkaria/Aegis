import { NextResponse } from "next/server";
import { computeAllProfiles } from "@aegis-ows/shared";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = computeAllProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read agent profiles" },
      { status: 500 }
    );
  }
}
