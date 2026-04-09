"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MoonPayConfig {
  hasApiKey: boolean;
  hasSecretKey: boolean;
  widgetMode: "embedded" | "external";
  features: string[];
}

export function MoonPayFundWidget({ agentId }: { agentId: string }) {
  const [config, setConfig] = useState<MoonPayConfig | null>(null);
  const [selectedToken, setSelectedToken] = useState("usdc");
  const [showWidget, setShowWidget] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/moonpay/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig({ hasApiKey: false, hasSecretKey: false, widgetMode: "external", features: [] }));
  }, []);

  const tokens = [
    { code: "usdc", label: "USDC", color: "text-blue-400" },
    { code: "sol", label: "SOL", color: "text-violet-400" },
    { code: "eth", label: "ETH", color: "text-sky-400" },
  ];

  async function handleFund() {
    setLoading(true);
    try {
      const res = await fetch("/api/moonpay/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: agentId,
          currencyCode: selectedToken,
          externalTransactionId: `aegis-${agentId}-${Date.now()}`,
        }),
      });
      const { url } = await res.json() as { url: string };

      if (config?.widgetMode === "embedded") {
        setWidgetUrl(url);
        setShowWidget(true);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Fallback to external URL
      window.open(
        `https://www.moonpay.com/buy/${selectedToken}?walletAddress=${agentId}`,
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
          <CardTitle className="text-base">Fund Agent Wallet</CardTitle>
          <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/20">
            MoonPay
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showWidget && widgetUrl ? (
          <div className="space-y-3">
            <iframe
              src={widgetUrl}
              className="w-full h-[500px] rounded-lg border border-white/[0.06]"
              allow="accelerometer; autoplay; camera; gyroscope; payment"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => { setShowWidget(false); setWidgetUrl(null); }}
            >
              Close Widget
            </Button>
          </div>
        ) : (
          <>
            {/* Token selector */}
            <div className="flex gap-2">
              {tokens.map((t) => (
                <button
                  key={t.code}
                  onClick={() => setSelectedToken(t.code)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    selectedToken === t.code
                      ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                      : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Fund button */}
            <Button
              className="w-full"
              onClick={handleFund}
              disabled={loading}
            >
              {loading ? "Loading..." : `Buy ${selectedToken.toUpperCase()} for ${agentId}`}
            </Button>

            {/* CLI fallback */}
            <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
              <p className="text-xs text-muted-foreground mb-1.5">CLI Alternative</p>
              <code className="text-xs font-mono text-foreground break-all">
                mp buy --currency {selectedToken} --wallet {agentId}
              </code>
            </div>

            {/* Mode indicator */}
            <p className="text-[10px] text-muted-foreground">
              {config?.widgetMode === "embedded"
                ? "Embedded mode — purchase completes in dashboard"
                : "External mode — opens MoonPay in a new tab"}
              {" · "}Supports Ethereum, Base, Solana, Polygon
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
