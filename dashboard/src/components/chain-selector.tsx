"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface ChainOption {
  id: string;
  name: string;
  dotColor: string;
  badgeColor: string;
  recommended?: boolean;
}

export const SUPPORTED_CHAINS: ChainOption[] = [
  {
    id: "eip155:1",
    name: "Ethereum",
    dotColor: "bg-gray-400",
    badgeColor: "text-gray-400 border-gray-500/20",
  },
  {
    id: "eip155:8453",
    name: "Base",
    dotColor: "bg-blue-400",
    badgeColor: "text-blue-400 border-blue-500/20",
    recommended: true,
  },
  {
    id: "eip155:137",
    name: "Polygon",
    dotColor: "bg-purple-400",
    badgeColor: "text-purple-400 border-purple-500/20",
  },
  {
    id: "eip155:42161",
    name: "Arbitrum",
    dotColor: "bg-sky-400",
    badgeColor: "text-sky-400 border-sky-500/20",
  },
  {
    id: "eip155:10",
    name: "Optimism",
    dotColor: "bg-red-400",
    badgeColor: "text-red-400 border-red-500/20",
  },
  {
    id: "stellar:pubnet",
    name: "Stellar",
    dotColor: "bg-gray-300",
    badgeColor: "text-gray-300 border-gray-400/20",
  },
  {
    id: "solana:mainnet",
    name: "Solana",
    dotColor: "bg-violet-400",
    badgeColor: "text-violet-400 border-violet-500/20",
  },
];

interface ChainSelectorProps {
  selectedChain: string;
  onChainChange: (chainId: string) => void;
}

export function ChainSelector({ selectedChain, onChainChange }: ChainSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUPPORTED_CHAINS.map((chain) => {
        const isSelected = selectedChain === chain.id;
        return (
          <button
            key={chain.id}
            onClick={() => onChainChange(chain.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              isSelected
                ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04]"
            }`}
          >
            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${chain.dotColor}`} />
            <span>{chain.name}</span>
            {chain.recommended && !isSelected && (
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 h-4 text-blue-400 border-blue-500/20"
              >
                Best
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
