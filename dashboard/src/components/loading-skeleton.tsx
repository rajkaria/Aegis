export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 animate-pulse">
      <div className="h-3 w-20 bg-white/[0.06] rounded mb-3" />
      <div className="h-7 w-24 bg-white/[0.06] rounded mb-2" />
      <div className="h-3 w-32 bg-white/[0.06] rounded" />
    </div>
  );
}

export function CardSkeleton({ height = "h-48" }: { height?: string }) {
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.03] ${height} animate-pulse`} />
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 animate-pulse">
      <div className="h-2 w-2 rounded-full bg-white/[0.06]" />
      <div className="h-4 w-24 bg-white/[0.06] rounded" />
      <div className="h-4 w-16 bg-white/[0.06] rounded ml-auto" />
      <div className="h-4 w-16 bg-white/[0.06] rounded" />
      <div className="h-4 w-16 bg-white/[0.06] rounded" />
    </div>
  );
}
