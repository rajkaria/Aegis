import { getUserId } from "@/lib/auth-helpers";
import { readWalletsForUser, readAgentsForUser } from "@/lib/supabase-data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateAgentForm } from "@/components/create-agent-form";

export const dynamic = "force-dynamic";

function WalletRow({ chain, address }: { chain: string; address: string }) {
  const label = chain === "solana" ? "SOL" : "EVM";
  const explorer =
    chain === "solana"
      ? `https://solscan.io/account/${address}`
      : `https://etherscan.io/address/${address}`;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          {label}
        </Badge>
        <span className="font-mono text-xs">
          {address.slice(0, 8)}...{address.slice(-6)}
        </span>
      </div>
      <a
        href={explorer}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-sky-400 hover:text-sky-300"
      >
        Explorer
      </a>
    </div>
  );
}

export default async function WalletsPage() {
  const userId = await getUserId();

  if (!userId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wallets</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to create agents and manage wallets.
          </p>
        </div>
      </div>
    );
  }

  const [wallets, agents] = await Promise.all([
    readWalletsForUser(userId),
    readAgentsForUser(userId),
  ]);

  // Group wallets by agent
  const walletsByAgent = new Map<string, typeof wallets>();
  for (const w of wallets) {
    const list = walletsByAgent.get(w.agentId) ?? [];
    list.push(w);
    walletsByAgent.set(w.agentId, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Wallets</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Agent wallet addresses and funding options.
        </p>
      </div>

      <CreateAgentForm />

      {agents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No agents yet. Create your first agent above to auto-generate
              Solana + EVM wallets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => {
            const agentWallets = walletsByAgent.get(agent.id) ?? [];
            return (
              <Card key={agent.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {agent.displayName ?? agent.name}
                    </CardTitle>
                    <Badge
                      variant={agent.status === "active" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {agent.name}
                  </span>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agentWallets.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No wallets generated for this agent.
                    </p>
                  ) : (
                    agentWallets.map((w) => (
                      <WalletRow key={w.id} chain={w.chain} address={w.publicAddress} />
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
