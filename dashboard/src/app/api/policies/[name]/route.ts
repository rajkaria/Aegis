import { NextResponse } from "next/server";
import {
  writeBudgetConfig,
  writeGuardConfig,
  writeDeadswitchConfig,
} from "@/lib/config-writer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const body = await req.json();

  try {
    switch (name) {
      case "aegis-budget":
        writeBudgetConfig(body);
        break;
      case "aegis-guard":
        writeGuardConfig(body);
        break;
      case "aegis-deadswitch":
        writeDeadswitchConfig(body);
        break;
      default:
        return NextResponse.json(
          { error: "Unknown policy" },
          { status: 404 }
        );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to write config" },
      { status: 500 }
    );
  }
}
