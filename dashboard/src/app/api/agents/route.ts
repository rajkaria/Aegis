import { NextResponse } from "next/server";
import { getEconomyOverview } from "@/lib/aegis-data";
import { getUserId } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { Keypair } from "@solana/web3.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { encryptPrivateKey } from "@/lib/encryption";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getUserId();
    const { profiles } = await getEconomyOverview(userId ?? undefined);
    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read agent profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { name, displayName } = body as { name?: string; displayName?: string };

    if (!name || name.length < 2 || name.length > 50) {
      return NextResponse.json({ error: "Agent name must be 2-50 characters" }, { status: 400 });
    }

    // Sanitize name: lowercase alphanumeric + hyphens
    const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

    const supabase = await createClient();

    // Check for duplicate name
    const { data: existing } = await supabase
      .from("agents")
      .select("id")
      .eq("user_id", userId)
      .eq("name", sanitized)
      .single();

    if (existing) {
      return NextResponse.json({ error: "An agent with this name already exists" }, { status: 409 });
    }

    // Create agent
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .insert({
        user_id: userId,
        name: sanitized,
        display_name: displayName || sanitized,
        status: "created",
      })
      .select("id, name, display_name, status")
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
    }

    // Generate Solana keypair
    const solKeypair = Keypair.generate();
    const solPriv = Buffer.from(solKeypair.secretKey).toString("hex");
    const solPub = solKeypair.publicKey.toBase58();
    const solEnc = encryptPrivateKey(solPriv);

    // Generate EVM keypair
    const evmPriv = generatePrivateKey();
    const evmAccount = privateKeyToAccount(evmPriv);
    const evmPub = evmAccount.address;
    const evmEnc = encryptPrivateKey(evmPriv);

    // Store wallets
    const { error: walletError } = await supabase.from("wallets").insert([
      {
        agent_id: agent.id,
        user_id: userId,
        chain: "solana",
        public_address: solPub,
        encrypted_private_key: solEnc.ciphertext,
        key_nonce: solEnc.nonce,
      },
      {
        agent_id: agent.id,
        user_id: userId,
        chain: "evm",
        public_address: evmPub,
        encrypted_private_key: evmEnc.ciphertext,
        key_nonce: evmEnc.nonce,
      },
    ]);

    if (walletError) {
      // Rollback agent creation
      await supabase.from("agents").delete().eq("id", agent.id);
      return NextResponse.json({ error: "Failed to create wallets" }, { status: 500 });
    }

    return NextResponse.json({
      agent,
      wallets: [
        { chain: "solana", address: solPub },
        { chain: "evm", address: evmPub },
      ],
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create agent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
