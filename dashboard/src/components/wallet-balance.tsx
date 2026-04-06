"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChainBalance {
  chain: string;
  chainId: string;
  token: string;
  balance: string;
  usdValue: string;
  source: string;
}

const CHAIN_COLORS: Record<string, string> = {
  Base: "bg-blue-500",
  Ethereum: "bg-violet-500",
  Solana: "bg-gradient-to-r from-purple-500 to-green-400",
  "XRP Ledger": "bg-gray-400",
  Stellar: "bg-gradient-to-r from-blue-400 to-purple-400",
  Polygon: "bg-purple-600",
  Arbitrum: "bg-blue-600",
};

const SOURCE_LABELS: Record<string, string> = {
  "solana-rpc": "Solana RPC",
  "xrpl-rpc": "XRPL RPC",
  zerion: "Zerion API",
  uniblock: "Uniblock",
  "stellar-horizon": "Stellar Horizon",
  fallback: "Cached",
};

export function WalletBalance({ agentId }: { agentId: string }) {
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/balances/${agentId}`)
      .then((r) => r.json())
      .then((data: { balances: ChainBalance[]; sources: string[] }) => {
        setBalances(data.balances);
        setSources(data.sources);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [agentId]);

  const totalUsd = balances.reduce(
    (sum, b) => sum + parseFloat(b.usdValue),
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Wallet Balance</CardTitle>
        <span className="text-lg font-bold tabular-nums">
          {loading ? "..." : `$${totalUsd.toFixed(2)}`}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : balances.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No balances found
          </p>
        ) : (
          balances.map((b, i) => (
            <div
              key={`${b.chain}-${b.token}-${i}`}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${CHAIN_COLORS[b.chain] ?? "bg-gray-500"}`}
                />
                <div>
                  <span className="text-sm font-medium">{b.token}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">
                    on {b.chain}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono tabular-nums">
                  {b.balance}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${b.usdValue}
                </div>
              </div>
            </div>
          ))
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            {sources.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="text-[9px] px-1.5 py-0"
              >
                {SOURCE_LABELS[s] ?? s}
              </Badge>
            ))}
          </div>
          <Badge variant="outline" className="text-[10px]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
            {sources.includes("fallback") ? "Cached" : "Live"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
