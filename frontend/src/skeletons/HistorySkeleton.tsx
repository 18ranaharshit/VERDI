// Performance: UI-only component - pure CSS shimmer, Suspense fallback for HistoryPage
export default function HistorySkeleton() {
  return (
    <div className="page-bg min-h-screen pt-20 pb-24 lg:pb-8 px-4 sm:px-6 lg:pl-[260px] lg:pr-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 rounded skeleton-shimmer" />
          <div className="h-10 w-24 rounded-xl skeleton-shimmer" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl skeleton-shimmer flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-48 rounded skeleton-shimmer mb-2" />
                <div className="h-3 w-32 rounded skeleton-shimmer" />
              </div>
              <div className="text-right">
                <div className="h-4 w-16 rounded skeleton-shimmer mb-1" />
                <div className="h-3 w-20 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
