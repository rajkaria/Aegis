interface ReputationBadgeProps {
  score: number;
  level: "new" | "trusted" | "verified" | "elite";
  compact?: boolean;
}

const levelConfig = {
  elite: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: "\u2605" },
  verified: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: "\u2713" },
  trusted: { color: "bg-sky-500/20 text-sky-400 border-sky-500/30", icon: "\u25CF" },
  new: { color: "bg-white/10 text-muted-foreground border-white/10", icon: "\u25CB" },
};

export function ReputationBadge({ score, level, compact }: ReputationBadgeProps) {
  const config = levelConfig[level];
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${config.color}`}>
        {config.icon} {score}
      </span>
    );
  }
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.color}`}>
      <span className="text-sm">{config.icon}</span>
      <div>
        <div className="text-xs font-bold">{score}/100</div>
        <div className="text-[10px] capitalize">{level}</div>
      </div>
    </div>
  );
}
