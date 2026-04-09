"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TxRecord {
  txHash: string;
  chain: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
  explorerUrl?: string;
}

const CHAIN_STYLES: Record<string, { label: string; dot: string; badge: string }> = {
  "eip155:1": {
    label: "Ethereum",
    dot: "bg-gray-400",
    badge: "text-gray-400 border-gray-500/20",
  },
  "eip155:8453": {
    label: "Base",
    dot: "bg-blue-400",
    badge: "text-blue-400 border-blue-500/20",
  },
  "eip155:137": {
    label: "Polygon",
    dot: "bg-purple-400",
    badge: "text-purple-400 border-purple-500/20",
  },
  "eip155:42161": {
    label: "Arbitrum",
    dot: "bg-sky-400",
    badge: "text-sky-400 border-sky-500/20",
  },
  "eip155:10": {
    label: "Optimism",
    dot: "bg-red-400",
    badge: "text-red-400 border-red-500/20",
  },
  "stellar:pubnet": {
    label: "Stellar",
    dot: "bg-gray-300",
    badge: "text-gray-300 border-gray-400/20",
  },
  "solana:mainnet": {
    label: "Solana",
    dot: "bg-violet-400",
    badge: "text-violet-400 border-violet-500/20",
  },
};

const STATUS_STYLES: Record<TxRecord["status"], string> = {
  confirmed: "text-emerald-400",
  pending: "text-yellow-400",
  failed: "text-red-400",
};

function TxRow({ tx }: { tx: TxRecord }) {
  const chainStyle = CHAIN_STYLES[tx.chain] ?? {
    label: tx.chain,
    dot: "bg-gray-400",
    badge: "text-gray-400 border-gray-500/20",
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
      <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${chainStyle.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${chainStyle.badge}`}>
            {chainStyle.label}
          </Badge>
          <span className="text-xs font-medium text-foreground">
            {tx.amount} {tx.token}
          </span>
          <span className={`text-xs font-medium ${STATUS_STYLES[tx.status]}`}>
            {tx.status}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px] text-muted-foreground font-mono truncate">
            {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
          </span>
          {tx.explorerUrl && (
            <a
              href={tx.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 hover:underline"
            >
              view
            </a>
          )}
        </div>
      </div>
      <time className="text-[10px] text-muted-foreground flex-shrink-0">
        {new Date(tx.timestamp).toLocaleTimeString()}
      </time>
    </div>
  );
}

export function UnifiedTxHistory({ agentId }: { agentId: string }) {
  // In the future, fetch from a persistent tx store keyed by agentId.
  // For now we show a placeholder — the UI chrome (chain badges, layout) is ready.
  const transactions: TxRecord[] = [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/20">
            Multi-Chain
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-[10px] text-muted-foreground">
              Payments sent via the Multi-Chain widget will appear here.
            </p>
            {/* Chain color legend */}
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {Object.entries(CHAIN_STYLES).map(([id, style]) => (
                <span key={id} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <TxRow key={tx.txHash} tx={tx} />
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-3">
          Agent: <span className="font-mono">{agentId}</span>
        </p>
      </CardContent>
    </Card>
  );
}
