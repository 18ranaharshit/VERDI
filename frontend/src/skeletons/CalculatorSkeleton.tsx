// Performance: UI-only component - pure CSS shimmer, Suspense fallback for CalculatorPage
export default function CalculatorSkeleton() {
  return (
    <div className="page-bg min-h-screen pt-20 pb-24 lg:pb-8 px-4 sm:px-6 lg:pl-[260px] lg:pr-6">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-40 rounded skeleton-shimmer mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-card h-80 skeleton-shimmer rounded-2xl" />
            <div className="glass-card h-64 skeleton-shimmer rounded-2xl" />
            <div className="h-13 skeleton-shimmer rounded-xl" />
          </div>
          <div className="space-y-5">
            <div className="glass-card h-64 skeleton-shimmer rounded-2xl" />
            <div className="glass-card h-48 skeleton-shimmer rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card h-24 skeleton-shimmer rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
