// Performance: Pure CSS bars - no chart library, lightweight DOM-only rendering
import { MODES, calculateCarbon, CAR_BASELINE } from '@/utils/carbon';
import type { TransportMode } from '@/types';

interface ComparisonBarsProps {
  distance: number;
  selectedMode: TransportMode | null;
}

export default function ComparisonBars({ distance, selectedMode }: ComparisonBarsProps) {
  const maxEmission = distance * CAR_BASELINE;
  if (maxEmission === 0) return null;

  const sorted = [...MODES].sort((a, b) => b.factor - a.factor);

  return (
    <div className="space-y-3">
      <h4 className="font-display font-semibold text-sm text-verdi-primary">All Modes Compared</h4>
      {sorted.map((mode) => {
        const emission = calculateCarbon(distance, mode.key);
        const pct = maxEmission > 0 ? (emission / maxEmission) * 100 : 0;
        const isSelected = selectedMode === mode.key;

        return (
          <div
            key={mode.key}
            className={`transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-display text-verdi-secondary flex items-center gap-1.5">
                <span>{mode.icon}</span>
                {mode.label}
              </span>
              <span className="text-xs font-mono text-verdi-primary font-medium">
                {emission.toLocaleString()} g
              </span>
            </div>
            <div className="h-3 rounded-full bg-verdi-card overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(pct, emission === 0 ? 2 : pct)}%`,
                  backgroundColor: mode.color,
                  minWidth: emission === 0 ? '8px' : undefined,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
