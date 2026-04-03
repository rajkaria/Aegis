import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Real OWS wallet addresses (from ows wallet list)
const OWS_WALLETS = [
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
  { id: "aegis-budget", name: "Aegis Budget \u2014 Spending Caps", executable: "aegis-budget" },
  { id: "aegis-guard", name: "Aegis Guard \u2014 Address Allowlist", executable: "aegis-guard" },
  { id: "aegis-deadswitch", name: "Aegis Deadswitch \u2014 Inactivity Kill Switch", executable: "aegis-deadswitch" },
];

export async function GET() {
  return NextResponse.json({
    wallets: OWS_WALLETS,
    policies: OWS_POLICIES,
    status: "connected",
    version: "1.2.0",
  });
}
