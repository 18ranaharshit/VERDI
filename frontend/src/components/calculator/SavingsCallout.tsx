// Performance: UI-only component - Framer Motion slide animation, pure client-side rendering
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import { calculateSaved, getModeInfo, getEquivalents } from '@/utils/carbon';
import type { TransportMode } from '@/types';

interface SavingsCalloutProps {
  distance: number;
  mode: TransportMode | null;
}

export default function SavingsCallout({ distance, mode }: SavingsCalloutProps) {
  const isEcoMode = mode && mode !== 'car';
  const saved = mode ? calculateSaved(distance, mode) : 0;
  const animatedSaved = useCountUp(saved);
  const equivalents = getEquivalents(saved);
  const modeInfo = mode ? getModeInfo(mode) : null;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {isEcoMode && saved > 0 && (
          <m.div
            key="savings-callout"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-4 sm:p-5"
              style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-glow)' }}>
              <p className="text-sm text-verdi-secondary mb-2 font-display">
                By choosing <span className="font-bold text-verdi-primary">{modeInfo?.label}</span> instead of a car:
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs">↓</span>
                <span className="font-mono font-bold text-2xl sm:text-3xl text-verdi-accent">
                  {Math.round(animatedSaved).toLocaleString()} g
                </span>
                <span className="text-sm text-verdi-secondary font-display">CO₂ saved</span>
              </div>
              <p className="text-xs text-verdi-muted font-mono">
                = {equivalents.phonesCharged} phone charges · {equivalents.treeHours} tree-hours
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
