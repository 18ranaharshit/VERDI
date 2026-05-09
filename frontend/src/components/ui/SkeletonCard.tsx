// Performance: UI-only component - CSS shimmer animation, no JS runtime cost
interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export default function SkeletonCard({ className = '', lines = 3 }: SkeletonCardProps) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
        <div className="flex-1">
          <div className="h-4 w-24 rounded skeleton-shimmer mb-2" />
          <div className="h-3 w-16 rounded skeleton-shimmer" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded skeleton-shimmer mb-2"
          style={{ width: `${80 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
