import {
  readLedger,
  readPolicyLog,
  readApprovals,
  readRegistry,
  readBudgetConfig,
  readGuardConfig,
  readApproveConfig,
  getSpentInPeriod,
} from "@aegis-ows/shared";
import type {
  BudgetLedger,
  BudgetConfig,
  LedgerEntry,
} from "@aegis-ows/shared";

export interface BudgetStatus {
  chainId: string;
  token: string;
  period: "daily" | "weekly" | "monthly";
  spent: number;
  limit: number;
  percentage: number;
}

export interface SpendingData {
  ledger: BudgetLedger;
  budgets: BudgetStatus[];
  total: number;
  todayTotal: number;
}

export function getSpendingData(): SpendingData {
  const ledger = readLedger();
  const budgetConfig = readBudgetConfig();

  const total = ledger.entries.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );

  const todayCutoff = new Date();
  todayCutoff.setHours(0, 0, 0, 0);
  const todayTotal = ledger.entries
    .filter((e) => new Date(e.timestamp) >= todayCutoff)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const budgets: BudgetStatus[] = [];

  if (budgetConfig) {
    // Collect unique apiKeyIds from the ledger
    const apiKeyIds = [...new Set(ledger.entries.map((e) => e.apiKeyId))];
    if (apiKeyIds.length === 0) apiKeyIds.push("default");

    for (const limit of budgetConfig.limits) {
      const periods: ("daily" | "weekly" | "monthly")[] = [];
      if (limit.daily) periods.push("daily");
      if (limit.weekly) periods.push("weekly");
      if (limit.monthly) periods.push("monthly");

      for (const period of periods) {
        const limitValue = parseFloat(
          limit[period] as string
        );
        // Aggregate spending across all apiKeyIds for this chain/token/period
        let totalSpent = 0;
        for (const apiKeyId of apiKeyIds) {
          totalSpent += getSpentInPeriod(
            ledger,
            apiKeyId,
            limit.chainId,
            limit.token,
            period
          );
        }

        budgets.push({
          chainId: limit.chainId,
          token: limit.token,
          period,
          spent: totalSpent,
          limit: limitValue,
          percentage: limitValue > 0 ? (totalSpent / limitValue) * 100 : 0,
        });
      }
    }
  }

  return { ledger, budgets, total, todayTotal };
}

export function getPolicyData() {
  const log = readPolicyLog();
  const budgetConfig = readBudgetConfig();
  const guardConfig = readGuardConfig();
  const approveConfig = readApproveConfig();

  return { log, budgetConfig, guardConfig, approveConfig };
}

export function getApprovalData() {
  return readApprovals();
}

export function getServiceData() {
  return readRegistry();
}
