// Performance: Skeleton placeholder for passport page - matches the dashboard-like layout
export default function PassportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 skeleton-shimmer rounded-xl" />
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 skeleton-shimmer rounded-2xl" />
        <div className="space-y-2">
          <div className="h-5 w-40 skeleton-shimmer rounded" />
          <div className="h-4 w-24 skeleton-shimmer rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 skeleton-shimmer rounded-xl" />
        ))}
      </div>
      <div className="h-40 skeleton-shimmer rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 skeleton-shimmer rounded-xl" />
        <div className="h-64 skeleton-shimmer rounded-xl" />
      </div>
    </div>
  );
}
