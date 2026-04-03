"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [enabled, router]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors border border-white/[0.06]"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
      {enabled ? "Live" : "Paused"}
    </button>
  );
}
