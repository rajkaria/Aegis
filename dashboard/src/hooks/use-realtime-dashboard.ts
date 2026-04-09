"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeEvent {
  table: string;
  type: "INSERT" | "UPDATE" | "DELETE";
  record: Record<string, unknown>;
  timestamp: string;
}

/**
 * Subscribe to Supabase Realtime changes on dashboard tables.
 * Returns a list of recent events and a refresh trigger.
 * Only active when Supabase is configured and user is authenticated.
 */
export function useRealtimeDashboard() {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    try {
      const supabase = createClient();

      channel = supabase
        .channel("dashboard-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "ledger_entries" },
          (payload) => {
            setEvents((prev) => [
              { table: "ledger_entries", type: payload.eventType as RealtimeEvent["type"], record: payload.new as Record<string, unknown>, timestamp: new Date().toISOString() },
              ...prev.slice(0, 49),
            ]);
            triggerRefresh();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "earnings_entries" },
          (payload) => {
            setEvents((prev) => [
              { table: "earnings_entries", type: payload.eventType as RealtimeEvent["type"], record: payload.new as Record<string, unknown>, timestamp: new Date().toISOString() },
              ...prev.slice(0, 49),
            ]);
            triggerRefresh();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "policy_log" },
          (payload) => {
            setEvents((prev) => [
              { table: "policy_log", type: payload.eventType as RealtimeEvent["type"], record: payload.new as Record<string, unknown>, timestamp: new Date().toISOString() },
              ...prev.slice(0, 49),
            ]);
            triggerRefresh();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "agents" },
          (payload) => {
            setEvents((prev) => [
              { table: "agents", type: payload.eventType as RealtimeEvent["type"], record: payload.new as Record<string, unknown>, timestamp: new Date().toISOString() },
              ...prev.slice(0, 49),
            ]);
            triggerRefresh();
          }
        )
        .subscribe((status) => {
          setConnected(status === "SUBSCRIBED");
        });
    } catch {
      // Supabase not configured — no-op
    }

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [triggerRefresh]);

  return { events, connected, refreshKey, triggerRefresh };
}
