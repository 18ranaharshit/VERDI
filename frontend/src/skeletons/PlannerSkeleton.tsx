// Performance: Skeleton placeholder for planner page - matches the layout during data loading
export default function PlannerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 skeleton-shimmer rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-14 skeleton-shimmer rounded-xl" />
          <div className="h-14 skeleton-shimmer rounded-xl" />
          <div className="h-12 skeleton-shimmer rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-28 skeleton-shimmer rounded-full" />
            ))}
          </div>
        </div>
        <div className="h-[500px] skeleton-shimmer rounded-xl" />
      </div>
    </div>
  );
}
