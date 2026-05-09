// Performance: UI-only component - renders 6 RouteResultCards in greenest-first order
import { LazyMotion, domAnimation, m } from 'framer-motion';
import RouteResultCard from './RouteResultCard';
import type { PlanResult } from '@/types';

const MODE_ORDER = ['cycling', 'walking', 'bus', 'electric_car', 'motorcycle', 'car'];

interface RouteComparisonPanelProps {
  plan: PlanResult;
  selectedMode: string | null;
  onModeSelect: (mode: string) => void;
}

export default function RouteComparisonPanel({ plan, selectedMode, onModeSelect }: RouteComparisonPanelProps) {
  const carDist = plan.routes.car.distanceKm;
  const cyclingSaved = plan.routes.cycling.carbonSaved;
  const cyclingCredits = plan.routes.cycling.creditsIfLogged;

  const originShort = plan.origin.text.split(',')[0];
  const destShort = plan.dest.text.split(',')[0];

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-display font-bold text-base text-verdi-primary">
            Route Results: {originShort} → {destShort}
          </h3>
          <span className="text-xs font-mono bg-verdi-subtle text-verdi-primary px-2.5 py-1 rounded-full">
            {carDist} km by car
          </span>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {MODE_ORDER.map((mode, i) => {
            const route = plan.routes[mode as keyof typeof plan.routes];
            return (
              <m.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <RouteResultCard
                  mode={mode}
                  result={route}
                  isSelected={selectedMode === mode}
                  onClick={() => onModeSelect(mode)}
                  originText={plan.origin.text}
                  destText={plan.dest.text}
                />
              </m.div>
            );
          })}
        </div>

        {/* Comparison summary */}
        <div className="mt-4 glass-card p-4 flex flex-wrap items-center justify-center gap-4 text-center">
          <p className="text-sm text-verdi-primary font-display font-semibold w-full">
            By cycling instead of driving this route:
          </p>
          <div className="flex items-center gap-6">
            <div>
              <p className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                {cyclingSaved} g
              </p>
              <p className="text-xs text-verdi-muted">CO₂ saved</p>
            </div>
            <div className="w-px h-8 bg-verdi-border" />
            <div>
              <p className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400">
                {cyclingCredits} points
              </p>
              <p className="text-xs text-verdi-muted">points earned</p>
            </div>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
