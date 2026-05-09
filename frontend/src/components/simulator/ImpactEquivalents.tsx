// Performance: UI-only component - 2x2 grid of human-readable carbon equivalents
import { useCountUp } from '@/hooks/useCountUp';
import type { SimulatorResult } from '@/types';

interface ImpactEquivalentsProps {
  result: SimulatorResult;
}

const ITEMS = [
  { key: 'treesEquivalent' as const, icon: '🌳', label: 'Trees Planted Equivalent', unit: 'trees/year' },
  { key: 'carsRemoved' as const, icon: '🚗', label: 'Cars Removed from Roads', unit: 'cars' },
  { key: 'flightsSaved' as const, icon: '✈️', label: 'Domestic Flights Saved', unit: 'flights' },
  { key: 'co2PctReduction' as const, icon: '📉', label: 'CO₂ Reduction', unit: '%' },
];

export default function ImpactEquivalents({ result }: ImpactEquivalentsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ITEMS.map((item) => (
        <EquivalentItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          value={result[item.key]}
          unit={item.unit}
        />
      ))}
    </div>
  );
}

function EquivalentItem({ icon, label, value, unit }: { icon: string; label: string; value: number; unit: string }) {
  const animated = useCountUp(value, 600);

  return (
    <div className="glass-card p-4 text-center rounded-xl hover:shadow-md transition-shadow">
      <span className="text-2xl block mb-2">{icon}</span>
      <p className="font-mono font-bold text-xl text-verdi-primary">{animated.toLocaleString()}</p>
      <p className="text-[10px] text-verdi-muted font-mono uppercase">{unit}</p>
      <p className="text-xs text-verdi-secondary font-display font-medium mt-1">{label}</p>
    </div>
  );
}
