// Performance: UI-only component - pure client-side math with animated counters
import { useCountUp } from '@/hooks/useCountUp';
import { getEquivalents } from '@/utils/carbon';
import GlassCard from '@/components/ui/GlassCard';

interface HumanEquivalentsProps {
  grams: number;
}

export default function HumanEquivalents({ grams }: HumanEquivalentsProps) {
  const equivalents = getEquivalents(grams);

  const phones = useCountUp(equivalents.phonesCharged);
  const trees = useCountUp(equivalents.treeHours);
  const driving = useCountUp(equivalents.drivingMeters);
  const kettle = useCountUp(equivalents.kettleBoils);

  const items = [
    { emoji: '📱', value: phones, label: 'Phone charges' },
    { emoji: '🌳', value: trees, label: 'Tree-hours absorbed' },
    { emoji: '🚗', value: driving, label: 'Meters driven (car)' },
    { emoji: '☕', value: kettle, label: 'Kettle boils' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <GlassCard key={item.label} className="p-3 text-center hover:-translate-y-0.5 transition-transform duration-200">
          <span className="text-2xl block mb-1">{item.emoji}</span>
          <span className="font-mono font-bold text-lg text-verdi-primary block">
            {item.value.toLocaleString()}
          </span>
          <span className="text-[11px] text-verdi-muted leading-tight block">{item.label}</span>
        </GlassCard>
      ))}
    </div>
  );
}
