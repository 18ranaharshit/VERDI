// Performance: UI-only component - controlled form inputs with 16px font-size for iOS
import { MapPin, Search } from 'lucide-react';
import type { TransportMode } from '@/types';
import ModeSelector from '@/components/ui/ModeSelector';

interface RouteInputFormProps {
  origin: string;
  destination: string;
  distance: number;
  mode: TransportMode | null;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onDistanceChange: (val: number) => void;
  onModeChange: (mode: TransportMode) => void;
  onSearchOrigin?: () => void;
  onSearchDestination?: () => void;
  isSearching?: boolean;
}

export default function RouteInputForm({
  origin, destination, distance, mode,
  onOriginChange, onDestinationChange, onDistanceChange, onModeChange,
  onSearchOrigin, onSearchDestination, isSearching
}: RouteInputFormProps) {
  return (
    <div className="space-y-5">
      {/* Step 1 - Route Input */}
      <div>
        <h3 className="font-display font-bold text-base text-verdi-primary mb-3">Route</h3>
        <div className="space-y-3">
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 w-4 h-4 text-verdi-accent" />
            <input
              type="text"
              value={origin}
              onChange={(e) => onOriginChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchOrigin?.()}
              placeholder="Starting point (e.g. Central Station)"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/90 dark:bg-[#022c22]/90 border border-verdi-border/50
                         text-base text-verdi-primary placeholder:text-verdi-primary/60 shadow-sm
                         focus:outline-none focus:bg-white dark:focus:bg-[#022c22] focus:border-verdi-accent focus:ring-1 focus:ring-verdi-glow
                         transition-all duration-200"
            />
            {onSearchOrigin && (
              <button 
                onClick={onSearchOrigin}
                disabled={isSearching || !origin.trim()}
                className="absolute right-2 p-2 text-verdi-muted hover:text-verdi-accent transition-colors disabled:opacity-50"
                title="Find on Map"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 w-4 h-4 text-verdi-accent" />
            <input
              type="text"
              value={destination}
              onChange={(e) => onDestinationChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchDestination?.()}
              placeholder="Destination (e.g. University Library)"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/90 dark:bg-[#022c22]/90 border border-verdi-border/50
                         text-base text-verdi-primary placeholder:text-verdi-primary/60 shadow-sm
                         focus:outline-none focus:bg-white dark:focus:bg-[#022c22] focus:border-verdi-accent focus:ring-1 focus:ring-verdi-glow
                         transition-all duration-200"
            />
            {onSearchDestination && (
              <button 
                onClick={onSearchDestination}
                disabled={isSearching || !destination.trim()}
                className="absolute right-2 p-2 text-verdi-muted hover:text-verdi-accent transition-colors disabled:opacity-50"
                title="Find on Map"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={distance || ''}
              onChange={(e) => onDistanceChange(parseFloat(e.target.value) || 0)}
              placeholder="Distance"
              min="0.1"
              max="1000"
              step="0.1"
              className="w-full pl-4 pr-16 py-3 rounded-xl bg-white/90 dark:bg-[#022c22]/90 border border-verdi-border/50
                         text-base text-verdi-primary placeholder:text-verdi-primary/60 font-mono shadow-sm
                         focus:outline-none focus:bg-white dark:focus:bg-[#022c22] focus:border-verdi-accent focus:ring-1 focus:ring-verdi-glow
                         transition-all duration-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-verdi-muted
                            bg-verdi-card px-2 py-0.5 rounded-md">
              km
            </span>
          </div>
        </div>
      </div>

      {/* Step 2 - Transport Mode */}
      <div>
        <h3 className="font-display font-bold text-base text-verdi-primary mb-3">Transport Mode</h3>
        <ModeSelector selected={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}
