"use client";

import { useEffect, useRef } from "react";
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
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const colorGradient =
    percentage > 90
      ? "from-red-500 to-red-400"
      : percentage > 70
        ? "from-yellow-500 to-orange-400"
        : "from-emerald-600 to-emerald-400";

  const textColor =
    percentage > 90
      ? "text-red-400"
      : percentage > 70
        ? "text-yellow-400"
        : "text-muted-foreground";

  const glowColor =
    percentage > 90
      ? "rgba(239, 68, 68, 0.5)"
      : percentage > 70
        ? "rgba(234, 179, 8, 0.5)"
        : "rgba(16, 185, 129, 0.5)";

  useEffect(() => {
    const bar = barRef.current;
    const glow = glowRef.current;
    if (!bar || !glow) return;

    // Animate from 0 to target width
    bar.style.width = "0%";
    glow.style.left = "0%";

    const timeout = setTimeout(() => {
      bar.style.transition = "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
      glow.style.transition = "left 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
      bar.style.width = `${cappedPercentage}%`;
      glow.style.left = `${cappedPercentage}%`;
    }, 80);

    return () => clearTimeout(timeout);
  }, [cappedPercentage]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{token}</span>
          <span className="text-muted-foreground text-xs">
            {chainId} / {period}
          </span>
        </div>
        <span className={cn("text-xs font-mono tabular-nums", textColor)}>
          {spent.toFixed(4)} / {limit.toFixed(4)}
        </span>
      </div>
      {/* Custom progress bar */}
      <div className="relative h-2.5 rounded-full bg-white/[0.06] overflow-visible">
        {/* Fill */}
        <div
          ref={barRef}
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
            colorGradient
          )}
          style={{ width: "0%" }}
        />
        {/* Glow dot at fill edge */}
        <div
          ref={glowRef}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full pointer-events-none"
          style={{
            left: "0%",
            boxShadow: `0 0 8px 3px ${glowColor}`,
            backgroundColor: glowColor,
            opacity: cappedPercentage > 1 ? 1 : 0,
          }}
        />
        {/* Floating percentage label */}
        <div
          className={cn(
            "absolute -top-6 -translate-x-1/2 text-[10px] font-mono tabular-nums pointer-events-none",
            textColor
          )}
          style={{ left: `${cappedPercentage}%` }}
        >
          {percentage.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
