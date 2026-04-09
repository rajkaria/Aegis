"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MoonPaySwapButton({
  agentId,
  fromToken,
  toToken,
}: {
  agentId: string;
  fromToken: string;
  toToken: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSwap() {
    setLoading(true);
    try {
      const res = await fetch("/api/moonpay/swap-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: agentId,
          fromCurrencyCode: fromToken.toLowerCase(),
          toCurrencyCode: toToken.toLowerCase(),
        }),
      });
      const { url } = await res.json() as { url: string };
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      window.open(
        `https://swap.moonpay.com?walletAddress=${agentId}`,
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
      onClick={handleSwap}
      disabled={loading}
    >
      {loading ? "..." : `Swap ${fromToken} → ${toToken}`}
    </Button>
  );
}
