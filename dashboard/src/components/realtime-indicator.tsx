"use client";

import { useRealtimeDashboard } from "@/hooks/use-realtime-dashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RealtimeIndicator() {
  const { connected, refreshKey } = useRealtimeDashboard();
  const router = useRouter();

  // When refreshKey changes (new realtime event), refresh server data
  useEffect(() => {
    if (refreshKey > 0) {
      router.refresh();
    }
  }, [refreshKey, router]);

  if (!connected) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Realtime
    </div>
  );
}
