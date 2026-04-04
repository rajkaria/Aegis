import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Static fallback wallets (for Vercel where OWS isn't installed)
const FALLBACK_WALLETS = [
  {
    name: "data-miner",
    id: "99f09597-fc06-45c8-99d6-014b9046a47e",
    addresses: {
      "eip155:1": "0x6344D6E94BbeBB612bA5eC55f3125Bf7a0B8666F",
      "solana:mainnet": "2G55SdspdgSLcrXm3ZcfSHuDhvuhXtQLWqf1zVbAYCcq",
    },
  },
  {
    name: "analyst",
    id: "b8e55e23-0858-440d-bc02-ead4b54c0c0c",
    addresses: {
      "eip155:1": "0x4ef5aaef757B4180512a52A17023E3471BA3e361",
      "solana:mainnet": "CePyeKXCtB6RzAatosDnnun3yryUzETKXA5rNEjPeSkL",
    },
  },
  {
    name: "research-buyer",
    id: "46863482-c8ae-4b7a-81b3-f21310eb1813",
    addresses: {
      "eip155:1": "0x2219FF712dbcf3fEE0a712bAD2E111D0008a2f1d",
      "solana:mainnet": "9LK89Mk3xQP3qf3bJjxW8Qe9HoiPer4EisY5tUoPY22A",
    },
  },
];

const OWS_POLICIES = [
  { id: "aegis-budget", name: "Aegis Budget — Spending Caps", executable: "aegis-budget" },
  { id: "aegis-guard", name: "Aegis Guard — Address Allowlist", executable: "aegis-guard" },
  { id: "aegis-deadswitch", name: "Aegis Deadswitch — Inactivity Kill Switch", executable: "aegis-deadswitch" },
];

function getOWSWallets() {
  try {
    const { execSync } = require("node:child_process");
    const { homedir } = require("node:os");
    const owsPath = `${homedir()}/.ows/bin`;
    const output = execSync("ows wallet list", {
      encoding: "utf-8",
      timeout: 5000,
      env: { ...process.env, PATH: `${owsPath}:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}` },
    }) as string;

    // Parse wallet entries from ows wallet list output
    const wallets: Array<{ name: string; id: string; addresses: Record<string, string> }> = [];
    const blocks = output.split(/\n(?=ID:)/);

    for (const block of blocks) {
      const idMatch = block.match(/ID:\s+(\S+)/);
      const nameMatch = block.match(/Name:\s+(\S+)/);
      if (!idMatch || !nameMatch) continue;

      const addresses: Record<string, string> = {};
      const addrMatches = block.matchAll(/(\S+:\S+)\s+\(\w+\)\s+→\s+(\S+)/g);
      for (const m of addrMatches) {
        addresses[m[1]] = m[2];
      }

      wallets.push({ name: nameMatch[1], id: idMatch[1], addresses });
    }

    return wallets.length > 0 ? wallets : FALLBACK_WALLETS;
  } catch {
    return FALLBACK_WALLETS;
  }
}

export async function GET() {
  const wallets = getOWSWallets();
  return NextResponse.json({
    wallets,
    policies: OWS_POLICIES,
    status: "connected",
    version: "1.2.0",
  });
}
