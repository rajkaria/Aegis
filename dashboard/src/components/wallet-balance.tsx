import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WalletBalanceProps {
  agentId: string;
}

// Mock balances -- in production this would query Zerion API or OWS SDK
const MOCK_BALANCES: Record<
  string,
  { chain: string; token: string; balance: string; usdValue: string }[]
> = {
  "data-miner": [
    { chain: "Base", token: "USDC", balance: "12.45", usdValue: "12.45" },
    { chain: "Base", token: "ETH", balance: "0.008", usdValue: "24.00" },
  ],
  analyst: [
    { chain: "Base", token: "USDC", balance: "34.20", usdValue: "34.20" },
    { chain: "Ethereum", token: "USDC", balance: "5.00", usdValue: "5.00" },
  ],
  "research-buyer": [
    { chain: "Base", token: "USDC", balance: "0.15", usdValue: "0.15" },
  ],
};

const CHAIN_COLORS: Record<string, string> = {
  Base: "bg-blue-500",
  Ethereum: "bg-purple-500",
};

export function WalletBalance({ agentId }: WalletBalanceProps) {
  const balances = MOCK_BALANCES[agentId] ?? [
    { chain: "Base", token: "USDC", balance: "0.00", usdValue: "0.00" },
  ];

  const totalUsd = balances.reduce(
    (sum, b) => sum + parseFloat(b.usdValue),
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Wallet Balance</CardTitle>
        <span className="text-lg font-bold">${totalUsd.toFixed(2)}</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {balances.map((b, i) => (
          <div
            key={`${b.chain}-${b.token}-${i}`}
            className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2 h-2 rounded-full ${CHAIN_COLORS[b.chain] ?? "bg-gray-500"}`}
              />
              <div>
                <span className="text-sm font-medium">{b.token}</span>
                <span className="text-xs text-muted-foreground ml-1.5">
                  on {b.chain}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono">{b.balance}</div>
              <div className="text-xs text-muted-foreground">
                ${b.usdValue}
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] text-muted-foreground">
            Balances via Zerion API
          </p>
          <Badge variant="outline" className="text-[10px]">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"
            />
            Live
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
