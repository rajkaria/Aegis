import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Payment sending requires server-side OWS wallet. Configure OWS to enable.",
    },
    { status: 501 }
  );
}
