"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RunEconomy({ onComplete }: { onComplete?: () => void }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ buyer_spent: string; analyst_earned: string; miner_earned: string } | null>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/simulate", { method: "POST" });
      const data = await res.json();
      setResult(data.cycle);
      onComplete?.();
    } catch {}
    setRunning(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={run}
        disabled={running}
        size="sm"
        className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
      >
        {running ? "Running..." : "Run Economy Cycle"}
      </Button>
      {result && (
        <span className="text-xs text-muted-foreground animate-fade-up">
          Buyer spent {result.buyer_spent} → Analyst earned {result.analyst_earned} → Miner earned {result.miner_earned}
        </span>
      )}
    </div>
  );
}
