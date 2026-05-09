// Performance: UI-only component - visual transport mode selector grid with spring animation
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { MODES } from '@/utils/carbon';
import type { TransportMode } from '@/types';

interface ModeSelectorProps {
  selected: TransportMode | null;
  onChange: (mode: TransportMode) => void;
}

const MODE_BG_COLORS: Record<TransportMode, string> = {
  car: 'rgba(239, 68, 68, 0.10)',
  motorcycle: 'rgba(249, 115, 22, 0.10)',
  bus: 'rgba(234, 179, 8, 0.10)',
  electric_car: 'rgba(6, 182, 212, 0.10)',
  cycling: 'rgba(16, 185, 129, 0.10)',
  walking: 'rgba(139, 92, 246, 0.10)',
};

const MODE_BORDER_COLORS: Record<TransportMode, string> = {
  car: 'var(--mode-car)',
  motorcycle: 'var(--mode-motorcycle)',
  bus: 'var(--mode-bus)',
  electric_car: 'var(--mode-electric)',
  cycling: 'var(--mode-cycling)',
  walking: 'var(--mode-walking)',
};

export default function ModeSelector({ selected, onChange }: ModeSelectorProps) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {MODES.map((mode) => {
          const isSelected = selected === mode.key;
          return (
            <m.button
              key={mode.key}
              onClick={() => onChange(mode.key)}
              whileTap={{ scale: 0.95 }}
              animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`glass-card relative p-3 sm:p-4 flex flex-col items-center gap-1.5
                         cursor-pointer transition-all duration-200 min-h-[90px]
                         hover:-translate-y-0.5 hover:shadow-lg`}
              style={{
                borderColor: isSelected ? MODE_BORDER_COLORS[mode.key] : undefined,
                borderWidth: isSelected ? '2px' : undefined,
                backgroundColor: isSelected ? MODE_BG_COLORS[mode.key] : undefined,
              }}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-verdi-accent flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-2xl">{mode.icon}</span>
              <span className="text-xs font-display font-semibold text-verdi-primary">{mode.label}</span>
              <span className="text-[10px] font-mono text-verdi-muted">{mode.factor} g/km</span>
            </m.button>
          );
        })}
      </div>
    </LazyMotion>
  );
}
