"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Receipt {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  chain: string;
  endpoint: string;
  receiptHash: string;
  proofTxHash?: string;
  status: string;
}

export function ReceiptList() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    fetch("/api/receipts")
      .then(r => r.json())
      .then((data: { receipts: Receipt[] }) => setReceipts(data.receipts))
      .catch(() => {});
  }, []);

  if (receipts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Payment Receipts
          <Badge variant="outline" className="text-[9px]">On-Chain Proofs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {receipts.slice(0, 10).map(r => (
          <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.from}</span>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="font-medium">{r.to}</span>
                <span className="text-muted-foreground font-mono text-xs">{r.amount} {r.token}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                Hash: {r.receiptHash.slice(0, 16)}...
              </div>
            </div>
            <div className="shrink-0">
              {r.proofTxHash ? (
                <a
                  href={`https://explorer.solana.com/tx/${r.proofTxHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    Anchored on Solana
                  </Badge>
                </a>
              ) : (
                <Badge variant="outline" className="text-[10px]">Pending</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
