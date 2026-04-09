import { NextResponse } from "next/server";
import { getPaymentRouter } from "@/lib/integrations/payments/router";
import type { FeeEstimate } from "@/lib/integrations/payments/types";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      chains?: string[];
      to: string;
      amount: string;
      token?: string;
    };

    const { to, amount, token } = body;

    if (!to || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: to, amount" },
        { status: 400 }
      );
    }

    const router = getPaymentRouter();
    const chains = body.chains ?? router.getSupportedChains();

    const results = await Promise.allSettled(
      chains.map((chain) =>
        router.estimateFees({ chain, to, amount, token })
      )
    );

    const estimates: FeeEstimate[] = results
      .filter(
        (r): r is PromiseFulfilledResult<FeeEstimate> => r.status === "fulfilled"
      )
      .map((r) => r.value);

    // Sort by feeUsd ascending (cheapest first)
    estimates.sort((a, b) => {
      const aFee = parseFloat(a.feeUsd ?? a.fee);
      const bFee = parseFloat(b.feeUsd ?? b.fee);
      return aFee - bFee;
    });

    return NextResponse.json({ estimates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
