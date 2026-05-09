// Performance: UI-only component - pure CSS shimmer, Suspense fallback for LeaderboardPage
export default function LeaderboardSkeleton() {
  return (
    <div className="page-bg min-h-screen pt-20 pb-24 lg:pb-8 px-4 sm:px-6 lg:pl-[260px] lg:pr-6">
      <div className="max-w-[720px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 rounded skeleton-shimmer" />
          <div className="h-8 w-48 rounded skeleton-shimmer" />
        </div>
        <div className="h-12 rounded-xl skeleton-shimmer mb-6" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <div className="w-8 h-5 rounded skeleton-shimmer" />
              <div className="w-10 h-10 rounded-full skeleton-shimmer flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded skeleton-shimmer mb-1" />
                <div className="h-3 w-20 rounded skeleton-shimmer" />
              </div>
              <div className="text-right">
                <div className="h-4 w-14 rounded skeleton-shimmer mb-1" />
                <div className="h-3 w-16 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
