"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Insight {
  type: "info" | "warning" | "success" | "alert";
  title: string;
  description: string;
  metric?: string;
}

const typeConfig = {
  alert: { icon: "\u{1F6A8}", badge: "bg-red-500/20 text-red-400 border-red-500/30", border: "border-l-red-500/50" },
  warning: { icon: "\u26A0\uFE0F", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", border: "border-l-yellow-500/50" },
  success: { icon: "\u2705", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", border: "border-l-emerald-500/50" },
  info: { icon: "\u{1F4CA}", badge: "bg-sky-500/20 text-sky-400 border-sky-500/30", border: "border-l-sky-500/50" },
};

export function EconomyInsights({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Economy Intelligence
          <Badge className="bg-violet-500/20 text-violet-400 border border-violet-500/30 text-[10px]">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, i) => {
          const config = typeConfig[insight.type];
          return (
            <div key={i} className={`p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] border-l-2 ${config.border}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{config.icon}</span>
                <span className="text-sm font-medium">{insight.title}</span>
                {insight.metric && (
                  <Badge className={`ml-auto text-[10px] ${config.badge}`}>{insight.metric}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
