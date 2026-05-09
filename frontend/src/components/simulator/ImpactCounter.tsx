// Performance: Uses useCountUp hook for smooth 60fps animated number transitions
import { useCountUp } from '@/hooks/useCountUp';

interface ImpactCounterProps {
  value: number;
  unit: string;
  label: string;
  color: string;
  prefix?: string;
}

export default function ImpactCounter({ value, unit, label, color, prefix = '' }: ImpactCounterProps) {
  const animated = useCountUp(value, 600);

  return (
    <div className="text-center">
      <p className="font-mono font-extrabold text-4xl sm:text-5xl leading-none" style={{ color }}>
        {prefix}{typeof animated === 'number' ? animated.toLocaleString() : animated}
      </p>
      <p className="font-mono text-sm mt-1" style={{ color, opacity: 0.7 }}>{unit}</p>
      <p className="text-xs text-verdi-muted mt-1 font-display font-medium">{label}</p>
    </div>
  );
}
