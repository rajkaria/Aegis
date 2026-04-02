"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PendingApproval } from "@aegis-ows/shared";

interface ApprovalCardProps {
  approval: PendingApproval;
  onResolve?: (id: string, action: "approved" | "rejected") => void;
}

export function ApprovalCard({ approval, onResolve }: ApprovalCardProps) {
  const isPending = approval.status === "pending";
  const isExpired =
    approval.status === "pending" &&
    new Date(approval.expiresAt) < new Date();

  const statusBadge = () => {
    if (isExpired) return <Badge variant="secondary">Expired</Badge>;
    switch (approval.status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      case "approved":
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
    }
  };

  return (
    <Card className={!isPending || isExpired ? "opacity-60" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-mono">{approval.id.slice(0, 8)}...</CardTitle>
          <p className="text-xs text-muted-foreground">{approval.apiKeyId}</p>
        </div>
        {statusBadge()}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Value</span>
            <p className="font-mono font-medium">{approval.estimatedValue} {approval.token}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Chain</span>
            <p className="font-medium">{approval.chainId}</p>
          </div>
          {approval.transaction.to && (
            <div className="col-span-2">
              <span className="text-muted-foreground text-xs">Target</span>
              <p className="font-mono text-xs truncate">{approval.transaction.to}</p>
            </div>
          )}
          {approval.reason && (
            <div className="col-span-2">
              <span className="text-muted-foreground text-xs">Reason</span>
              <p className="text-xs">{approval.reason}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
          <span>Created: {new Date(approval.createdAt).toLocaleString()}</span>
          <span>-</span>
          <span>Expires: {new Date(approval.expiresAt).toLocaleString()}</span>
        </div>
        {isPending && !isExpired && onResolve && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onResolve(approval.id, "approved")}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onResolve(approval.id, "rejected")}
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        )}
        {approval.resolvedAt && (
          <p className="text-xs text-muted-foreground">
            Resolved: {new Date(approval.resolvedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
