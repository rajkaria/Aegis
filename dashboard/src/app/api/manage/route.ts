import { NextResponse } from "next/server";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export const dynamic = "force-dynamic";

// Sanitize input — only allow alphanumeric, hyphens, underscores, dots
function sanitize(input: string): string {
  return input.replace(/[^a-zA-Z0-9._-]/g, "");
}

function validateWalletName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name);
}

function validatePolicyId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

function validateAddress(addr: string): boolean {
  // Solana base58: 32-44 chars of [1-9A-HJ-NP-Za-km-z]
  // EVM: 0x + 40 hex chars
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr) || /^0x[0-9a-fA-F]{40}$/.test(addr);
}

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
        const name = sanitize(params.name);
        if (!validateWalletName(name)) {
          return NextResponse.json({ error: "Invalid wallet name. Use alphanumeric characters, hyphens, and underscores only." }, { status: 400 });
        }
        const result = execSync(
          `ows wallet create --name "${name}"`,
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
        const name = sanitize(params.name);
        if (!validateWalletName(name)) {
          return NextResponse.json({ error: "Invalid policy name. Use alphanumeric characters, hyphens, and underscores only." }, { status: 400 });
        }
        const result = execSync(
          `ows policy register --name "${name}"`,
          { encoding: "utf-8", timeout: 15000, env }
        );
        return NextResponse.json({ success: true, output: result });
      }

      case "create_apikey": {
        const keyName = sanitize(params.name);
        if (!validateWalletName(keyName)) {
          return NextResponse.json({ error: "Invalid API key name. Use alphanumeric characters, hyphens, and underscores only." }, { status: 400 });
        }
        const walletArgs = (params.wallets as string[])
          .map((w: string) => `--wallet "${sanitize(w)}"`)
          .join(" ");
        const policyArgs = (params.policies as string[])
          .map((p: string) => `--policy "${sanitize(p)}"`)
          .join(" ");
        const result = execSync(
          `ows apikey create --name "${keyName}" ${walletArgs} ${policyArgs}`,
          { encoding: "utf-8", timeout: 15000, env }
        );
        return NextResponse.json({ success: true, output: result });
      }

      case "fund_solana": {
        if (!validateAddress(params.address)) {
          return NextResponse.json({ error: "Invalid Solana address." }, { status: 400 });
        }
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
        if (!validateAddress(params.fromAddress)) {
          return NextResponse.json({ error: "Invalid fromAddress." }, { status: 400 });
        }
        if (!validateAddress(params.toAddress)) {
          return NextResponse.json({ error: "Invalid toAddress." }, { status: 400 });
        }
        const fromWallet = sanitize(params.fromWallet);
        if (!validateWalletName(fromWallet)) {
          return NextResponse.json({ error: "Invalid wallet name." }, { status: 400 });
        }
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
          `ows sign send-tx --chain solana --wallet ${fromWallet} --rpc-url https://api.devnet.solana.com --json --tx ${hex}`,
          { encoding: "utf-8", timeout: 30000, env }
        );
        const parsed = JSON.parse(result.trim());
        return NextResponse.json({ success: true, txHash: parsed.tx_hash });
      }

      case "register_custom_policy": {
        const id = sanitize(params.id);
        const name = sanitize(params.name);
        if (!validatePolicyId(id)) {
          return NextResponse.json({ error: "Invalid policy ID. Use alphanumeric characters, hyphens, and underscores only." }, { status: 400 });
        }
        if (!validateWalletName(name)) {
          return NextResponse.json({ error: "Invalid policy name. Use alphanumeric characters, hyphens, and underscores only." }, { status: 400 });
        }
        // Restrict executable path — must be absolute and not contain shell chars
        const execPath = params.executable?.replace(/[;&|`$(){}]/g, "") ?? "";
        if (!execPath || !execPath.startsWith("/")) {
          return NextResponse.json({ error: "Executable must be an absolute path" }, { status: 400 });
        }
        const policyJson = {
          id,
          name,
          version: 1,
          created_at: new Date().toISOString(),
          rules: [],
          executable: execPath,
          config: null,
          action: params.policyAction || "deny",
        };
        writeFileSync(
          "/tmp/custom-policy.json",
          JSON.stringify(policyJson, null, 2)
        );
        const result = execSync(
          `ows policy create --file /tmp/custom-policy.json`,
          { encoding: "utf-8", timeout: 15000, env }
        );
        return NextResponse.json({ success: true, output: result });
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
