"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChainSelector, SUPPORTED_CHAINS } from "@/components/chain-selector";

interface TokenOption {
  symbol: string;
  label: string;
  color: string;
}

interface FeeEstimate {
  chain: string;
  fee: string;
  feeUsd?: string;
  estimatedTime: number;
}

function getTokensForChain(chainId: string): TokenOption[] {
  if (chainId.startsWith("stellar:")) {
    return [
      { symbol: "XLM", label: "XLM", color: "text-gray-300" },
      { symbol: "USDC", label: "USDC", color: "text-blue-400" },
    ];
  }
  if (chainId.startsWith("solana:")) {
    return [
      { symbol: "SOL", label: "SOL", color: "text-violet-400" },
      { symbol: "USDC", label: "USDC", color: "text-blue-400" },
    ];
  }
  // EVM chains
  return [
    { symbol: "ETH", label: "ETH", color: "text-sky-400" },
    { symbol: "USDC", label: "USDC", color: "text-blue-400" },
  ];
}

interface PaymentStatus {
  state: "idle" | "loading" | "error" | "done";
  message?: string;
}

export function MultiChainPaymentWidget({ agentId }: { agentId: string }) {
  const [selectedChain, setSelectedChain] = useState("eip155:8453");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [feeEstimate, setFeeEstimate] = useState<FeeEstimate | null>(null);
  const [fetchingFee, setFetchingFee] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>({ state: "idle" });

  const tokens = getTokensForChain(selectedChain);

  // Reset token when chain changes if current token not available on new chain
  useEffect(() => {
    const available = getTokensForChain(selectedChain).map((t) => t.symbol);
    if (!available.includes(selectedToken)) {
      setSelectedToken(available[0]);
    }
    setFeeEstimate(null);
  }, [selectedChain, selectedToken]);

  async function fetchFeeEstimate() {
    if (!amount || isNaN(parseFloat(amount))) return;
    setFetchingFee(true);
    try {
      const res = await fetch("/api/payments/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chains: [selectedChain],
          to: toAddress || "0x0000000000000000000000000000000000000001",
          amount,
          token: selectedToken,
        }),
      });
      const data = await res.json() as { estimates: FeeEstimate[] };
      if (data.estimates && data.estimates.length > 0) {
        setFeeEstimate(data.estimates[0]);
      }
    } catch {
      setFeeEstimate(null);
    } finally {
      setFetchingFee(false);
    }
  }

  async function handleSend() {
    if (!amount || !toAddress) return;
    setStatus({ state: "loading" });
    try {
      const res = await fetch("/api/payments/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain: selectedChain,
          to: toAddress,
          amount,
          token: selectedToken,
        }),
      });
      const data = await res.json() as { error?: string; txHash?: string };
      if (!res.ok) {
        setStatus({ state: "error", message: data.error ?? "Send failed" });
      } else {
        setStatus({ state: "done", message: `Transaction: ${data.txHash}` });
      }
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  const chainName = SUPPORTED_CHAINS.find((c) => c.id === selectedChain)?.name ?? selectedChain;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Send Payment</CardTitle>
          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/20">
            Multi-Chain
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chain selector */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Select chain</p>
          <ChainSelector selectedChain={selectedChain} onChainChange={setSelectedChain} />
        </div>

        {/* Token selector */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Token</p>
          <div className="flex gap-2">
            {tokens.map((t) => (
              <button
                key={t.symbol}
                onClick={() => setSelectedToken(t.symbol)}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  selectedToken === t.symbol
                    ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04]"
                }`}
              >
                <span className={t.color}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient address */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">To address</p>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x... or G... or a valid address"
            className="w-full px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/40 focus:bg-purple-500/5 transition-colors"
          />
        </div>

        {/* Amount input + fee estimate */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Amount</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setFeeEstimate(null); }}
              onBlur={fetchFeeEstimate}
              placeholder="0.00"
              className="flex-1 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/40 focus:bg-purple-500/5 transition-colors"
            />
            <span className="flex items-center px-3 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-muted-foreground">
              {selectedToken}
            </span>
          </div>
        </div>

        {/* Fee estimate display */}
        {(fetchingFee || feeEstimate) && (
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
            {fetchingFee ? (
              <p className="text-xs text-muted-foreground">Estimating fee...</p>
            ) : feeEstimate ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Est. network fee</span>
                <span className="text-foreground font-medium">
                  {feeEstimate.feeUsd ? `~$${parseFloat(feeEstimate.feeUsd).toFixed(4)}` : feeEstimate.fee}
                  <span className="text-muted-foreground ml-1">· ~{feeEstimate.estimatedTime}s on {chainName}</span>
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Send button */}
        <Button
          className="w-full"
          onClick={handleSend}
          disabled={!amount || !toAddress || status.state === "loading"}
        >
          {status.state === "loading"
            ? "Sending..."
            : `Send ${amount || "0"} ${selectedToken} via ${chainName}`}
        </Button>

        {/* Status display */}
        {status.state === "done" && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
            <p className="text-xs text-emerald-400 font-medium">Payment submitted</p>
            {status.message && (
              <p className="text-[10px] text-muted-foreground mt-1 font-mono break-all">{status.message}</p>
            )}
          </div>
        )}
        {status.state === "error" && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-xs text-red-400 font-medium">Error</p>
            <p className="text-[10px] text-muted-foreground mt-1">{status.message}</p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          Sending as agent <span className="font-mono">{agentId}</span>. OWS wallet required for signing.
        </p>
      </CardContent>
    </Card>
  );
}
