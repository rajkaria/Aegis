import { NextResponse } from "next/server";
import { addSimulatedCycle } from "@/lib/in-memory-store";

export const dynamic = "force-dynamic";

// Vercel Cron hits this endpoint on schedule to keep the economy alive
// Also callable manually: curl https://useaegis.xyz/api/cron
export async function GET(req: Request) {
  // Verify cron secret if set (optional security)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run a simulated economy cycle
  const result = addSimulatedCycle();

  return NextResponse.json({
    ok: true,
    message: "Economy cycle executed",
    ...result,
    nextRun: "30 minutes",
  });
}
