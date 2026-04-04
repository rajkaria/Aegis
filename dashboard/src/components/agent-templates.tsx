"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TEMPLATES = [
  {
    id: "data-scraper",
    name: "Data Scraper",
    description: "Scrapes web pages and sells structured data via x402",
    price: "0.001 SOL",
    endpoint: "/scrape",
    icon: "\uD83D\uDD0D",
    policies: ["aegis-budget", "aegis-guard"],
  },
  {
    id: "analyzer",
    name: "AI Analyzer",
    description: "Buys raw data, processes with AI, sells analysis reports",
    price: "0.005 SOL",
    endpoint: "/analyze",
    icon: "\uD83E\uDDE0",
    policies: ["aegis-budget", "aegis-guard", "aegis-deadswitch"],
  },
  {
    id: "aggregator",
    name: "Data Aggregator",
    description: "Collects data from multiple sources and provides unified feeds",
    price: "0.01 SOL",
    endpoint: "/aggregate",
    icon: "\uD83D\uDCCA",
    policies: ["aegis-budget"],
  },
  {
    id: "monitor",
    name: "Chain Monitor",
    description: "Watches on-chain events and sells alerts to subscribers",
    price: "0.002 SOL",
    endpoint: "/alerts",
    icon: "\uD83D\uDC41\uFE0F",
    policies: ["aegis-budget", "aegis-deadswitch"],
  },
];

export function AgentTemplates() {
  const [deploying, setDeploying] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  async function deploy(template: typeof TEMPLATES[0]) {
    setDeploying(template.id);
    setResult(null);
    try {
      // Create wallet
      const walletRes = await fetch("/api/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_wallet", name: template.id + "-" + Date.now().toString(36) }),
      });
      const walletData = await walletRes.json();

      if (walletData.success) {
        setResult({
          id: template.id,
          success: true,
          message: `${template.name} agent deployed! Wallet created with addresses on all supported chains. Configure Gate with: aegisGate({ price: "${template.price.split(" ")[0]}", agentId: "${template.id}" })`,
        });
      } else {
        setResult({
          id: template.id,
          success: false,
          message: walletData.error ?? "Deploy failed. OWS must be installed locally.",
        });
      }
    } catch {
      setResult({
        id: template.id,
        success: false,
        message: "Could not connect to OWS. Run setup.sh locally first.",
      });
    }
    setDeploying(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Agent Templates</CardTitle>
          <Badge variant="outline" className="text-[10px]">One-Click Deploy</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Pre-configured agents ready to deploy. Each creates an OWS wallet and suggests a Gate configuration.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <div key={t.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold">{t.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{t.price} per call</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => deploy(t)}
                  disabled={deploying === t.id}
                  className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 h-7 px-3"
                >
                  {deploying === t.id ? "..." : "Deploy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t.description}</p>
              <div className="flex gap-1 mt-2">
                {t.policies.map(p => (
                  <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground border border-white/[0.06]">
                    {p.replace("aegis-", "")}
                  </span>
                ))}
              </div>
              {result?.id === t.id && (
                <div className={`mt-3 p-2 rounded text-xs ${result.success ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {result.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
