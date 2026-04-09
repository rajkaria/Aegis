"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MoonPaySellWidget({
  agentId,
  profitLoss,
}: {
  agentId: string;
  profitLoss: number;
}) {
  const [selectedToken, setSelectedToken] = useState("usdc");
  const [loading, setLoading] = useState(false);

  // Only show withdraw when agent is profitable
  if (profitLoss <= 0) return null;

  const tokens = [
    { code: "usdc", label: "USDC" },
    { code: "sol", label: "SOL" },
    { code: "eth", label: "ETH" },
  ];

  async function handleWithdraw() {
    setLoading(true);
    try {
      const res = await fetch("/api/moonpay/sell-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: agentId,
          currencyCode: selectedToken,
          externalTransactionId: `aegis-sell-${agentId}-${Date.now()}`,
        }),
      });
      const { url } = await res.json() as { url: string };
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      window.open(
        `https://sell.moonpay.com?currencyCode=${selectedToken}&walletAddress=${agentId}`,
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Withdraw Profits</CardTitle>
          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/20">
            +${profitLoss.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cash out agent profits to your bank account via MoonPay off-ramp.
        </p>

        <div className="flex gap-2">
          {tokens.map((t) => (
            <button
              key={t.code}
              onClick={() => setSelectedToken(t.code)}
              className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                selectedToken === t.code
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
          onClick={handleWithdraw}
          disabled={loading}
        >
          {loading ? "Loading..." : `Sell ${selectedToken.toUpperCase()} → Fiat`}
        </Button>

        <p className="text-[10px] text-muted-foreground">
          Crypto-to-fiat via MoonPay. Funds delivered to your bank account.
        </p>
      </CardContent>
    </Card>
  );
}
