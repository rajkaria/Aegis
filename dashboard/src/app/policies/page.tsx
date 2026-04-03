import { getPolicyData } from "@/lib/aegis-data";
import { PolicyCard } from "@/components/policy-card";

export const dynamic = "force-dynamic";

export default function PoliciesPage() {
  const { log, budgetConfig, guardConfig, deadswitchConfig } = getPolicyData();

  const policies = [
    {
      name: "aegis-budget",
      displayName: "Aegis Budget",
      config: budgetConfig,
    },
    {
      name: "aegis-guard",
      displayName: "Aegis Guard",
      config: guardConfig,
    },
    {
      name: "aegis-deadswitch",
      displayName: "Aegis Deadswitch",
      config: deadswitchConfig,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Policies</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Policy configuration and enforcement statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <PolicyCard
            key={policy.name}
            name={policy.name}
            displayName={policy.displayName}
            config={policy.config}
            entries={log.entries}
          />
        ))}
      </div>
    </div>
  );
}
