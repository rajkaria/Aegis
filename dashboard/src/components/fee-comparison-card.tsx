"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChainInfo {
  chainId: string;
  name: string;
  nativeToken: string;
  gasModel: string;
  avgBlockTime: number;
  blockExplorer: string;
  tier: "cheap" | "moderate" | "expensive";
  recommended?: boolean;
}

const TIER_STYLES: Record<ChainInfo["tier"], string> = {
  cheap: "text-emerald-400",
  moderate: "text-yellow-400",
  expensive: "text-red-400",
};

const TIER_LABEL: Record<ChainInfo["tier"], string> = {
  cheap: "Low fee",
  moderate: "Moderate",
  expensive: "High fee",
};

const CHAIN_DOT: Record<string, string> = {
  "eip155:1": "bg-gray-400",
  "eip155:8453": "bg-blue-400",
  "eip155:137": "bg-purple-400",
  "eip155:42161": "bg-sky-400",
  "eip155:10": "bg-red-400",
  "stellar:pubnet": "bg-gray-300",
  "solana:mainnet": "bg-violet-400",
};

export function FeeComparisonCard() {
  const [chains, setChains] = useState<ChainInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payments/chains")
      .then((r) => r.json())
      .then((data: { chains: ChainInfo[] }) => {
        setChains(data.chains ?? []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load chain data");
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Chain Fee Comparison</CardTitle>
          <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/20">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-white/[0.02] border border-white/[0.06] animate-pulse"
              />
            ))}
          </div>
        )}
        {error && (
          <p className="text-xs text-red-400 py-4 text-center">{error}</p>
        )}
        {!loading && !error && chains.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">No chain data available.</p>
        )}
        {!loading && !error && chains.length > 0 && (
          <div className="space-y-2">
            {chains.map((chain) => (
              <div
                key={chain.chainId}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]"
              >
                {/* Dot */}
                <span
                  className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${CHAIN_DOT[chain.chainId] ?? "bg-gray-400"}`}
                />

                {/* Name + native token */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{chain.name}</span>
                    {chain.recommended && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 h-4 text-blue-400 border-blue-500/20"
                      >
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {chain.nativeToken} · {chain.avgBlockTime}s blocks · {chain.gasModel}
                  </span>
                </div>

                {/* Cost tier */}
                <span className={`text-xs font-medium flex-shrink-0 ${TIER_STYLES[chain.tier]}`}>
                  {TIER_LABEL[chain.tier]}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-3">
          Fee tiers: green = cheap L2s, yellow = moderate, red = expensive L1.
        </p>
      </CardContent>
    </Card>
  );
}
