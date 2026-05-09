// Performance: UI-only component - pill button for saved routes
import { Bookmark, X } from 'lucide-react';
import type { SavedRoute } from '@/types';

interface SavedRouteChipProps {
  route: SavedRoute;
  onClick: () => void;
  onDelete: () => void;
}

export default function SavedRouteChip({ route, onClick, onDelete }: SavedRouteChipProps) {
  return (
    <div className="inline-flex items-center gap-2 glass-card px-3 py-2 rounded-full group cursor-pointer hover:shadow-md transition-all">
      <button onClick={onClick} className="flex items-center gap-2 min-w-0">
        <Bookmark className="w-3.5 h-3.5 text-verdi-accent flex-shrink-0" />
        <span className="text-xs font-display font-semibold text-verdi-primary truncate max-w-[140px]">
          {route.name}
        </span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 text-verdi-muted hover:text-red-500 transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
