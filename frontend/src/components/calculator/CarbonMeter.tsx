// Performance: UI-only component - SVG arc gauge with CSS transitions, no external library
import { useCountUp } from '@/hooks/useCountUp';
import type { TransportMode } from '@/types';
import { getModeInfo, getMaxEmission } from '@/utils/carbon';

interface CarbonMeterProps {
  emission: number;
  distance: number;
  mode: TransportMode | null;
}

export default function CarbonMeter({ emission, distance, mode }: CarbonMeterProps) {
  const animatedEmission = useCountUp(emission);
  const maxEmission = getMaxEmission(distance || 10);
  const ratio = maxEmission > 0 ? Math.min(emission / maxEmission, 1) : 0;

  const radius = 90;
  const strokeWidth = 12;
  const center = 110;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle; // 270 degrees

  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalAngle / 360) * circumference;
  const filledLength = arcLength * ratio;
  const dashOffset = arcLength - filledLength;

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const startRad = (start * Math.PI) / 180;
    const endRad = (end * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const arcPath = describeArc(center, center, radius, startAngle, endAngle);
  const modeInfo = mode ? getModeInfo(mode) : null;

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="200" viewBox="0 0 220 200" className="drop-shadow-lg">
        <defs>
          <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="4 8"
        />

        {/* Filled arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#meterGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength}`}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />

        {/* Center text */}
        <text x={center} y={center - 8} textAnchor="middle" className="font-mono text-verdi-primary" fill="var(--text-primary)" fontSize="36" fontWeight="700" fontFamily="DM Mono">
          {Math.round(animatedEmission)}
        </text>
        <text x={center} y={center + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="13" fontFamily="Plus Jakarta Sans">
          grams CO₂
        </text>
      </svg>

      {modeInfo && (
        <div className="text-center -mt-2">
          <span className="text-lg mr-1">{modeInfo.icon}</span>
          <span className="font-display font-semibold text-sm text-verdi-secondary">{modeInfo.label}</span>
          <span className="font-mono text-xs text-verdi-muted ml-2">{modeInfo.factor} g/km</span>
        </div>
      )}
    </div>
  );
}
