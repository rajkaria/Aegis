import { NextResponse } from "next/server";
import { readLedger } from "@aegis-ows/shared";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ledger = readLedger();
    const headers = [
      "timestamp",
      "apiKeyId",
      "chainId",
      "token",
      "amount",
      "txHash",
      "tool",
      "description",
    ];

    const rows = ledger.entries.map((entry) =>
      headers
        .map((h) => {
          const value = entry[h as keyof typeof entry] ?? "";
          const str = String(value);
          // Escape CSV values containing commas or quotes
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="aegis-ledger-export.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export ledger" },
      { status: 500 }
    );
  }
}
