import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BudgetBarProps {
  chainId: string;
  token: string;
  period: string;
  spent: number;
  limit: number;
  percentage: number;
}

export function BudgetBar({
  chainId,
  token,
  period,
  spent,
  limit,
  percentage,
}: BudgetBarProps) {
  const cappedPercentage = Math.min(percentage, 100);

  const colorClass =
    percentage > 90
      ? "[&>div]:bg-red-500"
      : percentage > 70
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {token}
          </span>
          <span className="text-muted-foreground text-xs">
            {chainId} / {period}
          </span>
        </div>
        <span
          className={cn(
            "text-xs font-mono",
            percentage > 90
              ? "text-red-500"
              : percentage > 70
                ? "text-yellow-500"
                : "text-muted-foreground"
          )}
        >
          {spent.toFixed(4)} / {limit.toFixed(4)} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <Progress
        value={cappedPercentage}
        className={cn("h-2", colorClass)}
      />
    </div>
  );
}
