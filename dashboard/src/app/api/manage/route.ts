import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const { action, ...params } = body;

  const owsPath = `${process.env.HOME}/.ows/bin`;
  const env = {
    ...process.env,
    PATH: `${owsPath}:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`,
  };

  try {
    switch (action) {
      case "create_wallet": {
        const result = execSync(
          `ows wallet create --name "${params.name}"`,
          { encoding: "utf-8", timeout: 15000, env }
        );
        return NextResponse.json({ success: true, output: result });
      }

      case "list_wallets": {
        const result = execSync("ows wallet list", {
          encoding: "utf-8",
          timeout: 15000,
          env,
        });
        return NextResponse.json({ success: true, output: result });
      }

      case "list_policies": {
        const result = execSync("ows policy list", {
          encoding: "utf-8",
          timeout: 15000,
          env,
        });
        return NextResponse.json({ success: true, output: result });
      }

      case "register_policy": {
        const result = execSync(
          `ows policy register --name "${params.name}"`,
          { encoding: "utf-8", timeout: 15000, env }
        );
        return NextResponse.json({ success: true, output: result });
      }

      case "create_apikey": {
        const walletArgs = (params.wallets as string[])
          .map((w: string) => `--wallet "${w}"`)
          .join(" ");
        const policyArgs = (params.policies as string[])
          .map((p: string) => `--policy "${p}"`)
          .join(" ");
        const result = execSync(
          `ows apikey create --name "${params.name}" ${walletArgs} ${policyArgs}`,
          { encoding: "utf-8", timeout: 15000, env }
        );
        return NextResponse.json({ success: true, output: result });
      }

      case "fund_solana": {
        const { Connection, PublicKey, LAMPORTS_PER_SOL } = await import(
          "@solana/web3.js"
        );
        const conn = new Connection(
          "https://api.devnet.solana.com",
          "confirmed"
        );
        const sig = await conn.requestAirdrop(
          new PublicKey(params.address),
          Math.floor(parseFloat(params.amount) * LAMPORTS_PER_SOL)
        );
        return NextResponse.json({ success: true, signature: sig });
      }

      case "send_sol": {
        const {
          Connection,
          PublicKey,
          SystemProgram,
          Transaction,
          LAMPORTS_PER_SOL,
        } = await import("@solana/web3.js");
        const conn = new Connection(
          "https://api.devnet.solana.com",
          "finalized"
        );
        const from = new PublicKey(params.fromAddress);
        const to = new PublicKey(params.toAddress);
        const { blockhash } = await conn.getLatestBlockhash("finalized");

        const tx = new Transaction({
          recentBlockhash: blockhash,
          feePayer: from,
        }).add(
          SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: to,
            lamports: Math.floor(parseFloat(params.amount) * LAMPORTS_PER_SOL),
          })
        );

        const hex = Buffer.from(
          tx.serialize({
            verifySignatures: false,
            requireAllSignatures: false,
          })
        ).toString("hex");

        const result = execSync(
          `ows sign send-tx --chain solana --wallet ${params.fromWallet} --rpc-url https://api.devnet.solana.com --json --tx ${hex}`,
          { encoding: "utf-8", timeout: 30000, env }
        );
        const parsed = JSON.parse(result.trim());
        return NextResponse.json({ success: true, txHash: parsed.tx_hash });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message?.slice(0, 200),
      },
      { status: 500 }
    );
  }
}
