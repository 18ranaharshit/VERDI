// Performance: UI-only component - pure CSS shimmer, Suspense fallback for DashboardPage
export default function DashboardSkeleton() {
  return (
    <div className="page-bg min-h-screen pt-20 pb-24 lg:pb-8 px-4 sm:px-6 lg:pl-[260px] lg:pr-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 h-32">
              <div className="w-10 h-10 rounded-xl skeleton-shimmer mb-3" />
              <div className="h-7 w-20 rounded skeleton-shimmer mb-2" />
              <div className="h-3 w-28 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card h-72 skeleton-shimmer rounded-2xl" />
          <div className="glass-card h-72 skeleton-shimmer rounded-2xl" />
        </div>
        <div className="glass-card h-64 skeleton-shimmer rounded-2xl" />
      </div>
    </div>
  );
}
