"use client";
import { useRouter } from "next/navigation";
import { RunEconomy } from "./run-economy";
import { AutoRefresh } from "./auto-refresh";

export function DashboardControls() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <RunEconomy onComplete={() => router.refresh()} />
      <AutoRefresh />
    </div>
  );
}
