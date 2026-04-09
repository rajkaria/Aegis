"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  status: string;
  cryptoAmount?: string;
  baseCurrencyAmount?: string;
  baseCurrency?: string;
  currency?: string;
  walletAddress?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  waitingPayment: { label: "Waiting for Payment", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  pending: { label: "Processing", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
  waitingAuthorization: { label: "Needs Authorization", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  completed: { label: "Completed", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  failed: { label: "Failed", color: "text-red-400 border-red-500/20 bg-red-500/10" },
};

export function MoonPayTransactionStatus({ externalId }: { externalId: string }) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    async function poll() {
      try {
        const res = await fetch(`/api/moonpay/transactions?externalId=${encodeURIComponent(externalId)}`);
        if (!res.ok) { setError(true); return; }
        const data = await res.json() as Transaction;
        setTransaction(data);

        // Stop polling when terminal
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(intervalId);
        }
      } catch {
        setError(true);
      }
    }

    poll();
    intervalId = setInterval(poll, 10_000); // Poll every 10s

    return () => clearInterval(intervalId);
  }, [externalId]);

  if (error || !transaction) return null;

  const config = statusConfig[transaction.status] ?? statusConfig.pending;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <Badge variant="outline" className={`text-[10px] ${config.color}`}>
        {config.label}
      </Badge>
      {transaction.baseCurrencyAmount && transaction.baseCurrency && (
        <span className="text-xs text-muted-foreground">
          ${transaction.baseCurrencyAmount} {transaction.baseCurrency.toUpperCase()}
        </span>
      )}
      {transaction.cryptoAmount && transaction.currency && (
        <span className="text-xs text-emerald-400">
          → {transaction.cryptoAmount} {transaction.currency.toUpperCase()}
        </span>
      )}
    </div>
  );
}
