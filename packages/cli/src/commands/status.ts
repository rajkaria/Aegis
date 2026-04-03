import { Command } from "commander";
import { computeAllProfiles, readDeadswitchConfig } from "@aegis-ows/shared";

export const statusCommand = new Command("status")
  .description("Show agent economy status and P&L")
  .action(() => {
    const profiles = computeAllProfiles();

    if (profiles.length === 0) {
      console.log("No agent activity recorded yet.");
      return;
    }

    console.log("Agent Economy Status:\n");
    console.log("  Agent              Revenue    Spending   P/L");
    console.log("  " + "-".repeat(55));

    for (const p of profiles) {
      const pl = p.profitLoss >= 0 ? `+$${p.profitLoss.toFixed(2)}` : `-$${Math.abs(p.profitLoss).toFixed(2)}`;
      console.log(`  ${p.agentId.padEnd(20)} $${p.totalRevenue.toFixed(2).padStart(8)} $${p.totalSpending.toFixed(2).padStart(8)}   ${pl}`);
    }

    const ds = readDeadswitchConfig();
    if (ds?.enabled) {
      console.log(`\nDeadswitch: Active (${ds.maxInactiveMinutes}min timeout)`);
      if (ds.lastHeartbeat) {
        const elapsed = (Date.now() - new Date(ds.lastHeartbeat).getTime()) / 60000;
        console.log(`  Last heartbeat: ${elapsed.toFixed(0)}min ago (triggers at ${ds.maxInactiveMinutes}min)`);
      }
    }
  });
