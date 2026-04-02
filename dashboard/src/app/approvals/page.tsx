"use client";

import { useEffect, useState, useCallback } from "react";
import type { PendingApproval } from "@aegis-ows/shared";
import { ApprovalCard } from "@/components/approval-card";
import { Separator } from "@/components/ui/separator";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch("/api/approvals");
      const data = await res.json();
      setApprovals(data.pending || []);
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleResolve = async (id: string, action: "approved" | "rejected") => {
    try {
      await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      await fetchApprovals();
    } catch (err) {
      console.error("Failed to resolve approval:", err);
    }
  };

  const pending = approvals.filter(
    (a) => a.status === "pending" && new Date(a.expiresAt) >= new Date()
  );
  const resolved = approvals.filter(
    (a) => a.status !== "pending" || new Date(a.expiresAt) < new Date()
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Approvals</h2>
          <p className="text-muted-foreground text-sm mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Approvals</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Review and manage pending transaction approvals.
        </p>
      </div>

      {pending.length > 0 ? (
        <>
          <h3 className="text-lg font-semibold">
            Pending ({pending.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((a) => (
              <ApprovalCard
                key={a.id}
                approval={a}
                onResolve={handleResolve}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
          No pending approvals.
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <Separator />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Resolved ({resolved.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolved.map((a) => (
              <ApprovalCard key={a.id} approval={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
