import { StatCardSkeleton, CardSkeleton, TableRowSkeleton } from "@/components/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-4 w-64 bg-white/[0.04] rounded mt-2 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <CardSkeleton height="h-64" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-3">
          <div className="h-5 w-20 bg-white/[0.06] rounded animate-pulse" />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-3">
          <div className="h-5 w-24 bg-white/[0.06] rounded animate-pulse" />
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </div>
      </div>
    </div>
  );
}
