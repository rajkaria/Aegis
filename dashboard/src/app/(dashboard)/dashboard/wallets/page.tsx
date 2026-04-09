import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Wallets</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Agent wallet addresses, balances, and funding options.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create agents to auto-generate Solana + EVM wallets. Fund them via
            MoonPay or direct transfer. Track balances in real-time.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This page will show all your agent wallets once you create your first agent.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
