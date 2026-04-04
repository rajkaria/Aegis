import { StatCardSkeleton, TableRowSkeleton } from "@/components/loading-skeleton";

export default function AgentsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 bg-white/[0.06] rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-3">
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
      </div>
    </div>
  );
}
