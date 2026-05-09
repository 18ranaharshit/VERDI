// Performance: Recharts lazy-loaded at page level - only individual chart components imported here
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import GlassCard from '@/components/ui/GlassCard';
import type { DayData } from '@/types';

interface SavingsLineChartProps {
  data: DayData[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="glass-card-strong p-3 text-sm">
      <p className="font-display font-semibold text-verdi-primary">{label}</p>
      <p className="font-mono text-verdi-accent">{value.toLocaleString()} g CO₂ saved</p>
      <p className="text-verdi-muted text-xs">≈ {Math.round(value / 8.22)} phone charges</p>
    </div>
  );
}

export default function SavingsLineChart({ data }: SavingsLineChartProps) {
  const width = useWindowWidth();
  const chartHeight = width < 640 ? 200 : 280;

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    saved: d.carbonSaved,
  }));

  return (
    <GlassCard className="p-4 sm:p-6">
      <h3 className="font-display font-bold text-lg text-verdi-primary mb-4">
        Your CO₂ Savings - Last 30 Days
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fontFamily: 'DM Mono', fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            interval={width < 375 ? 6 : 4}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: 'DM Mono', fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="saved"
            stroke="var(--accent)"
            strokeWidth={2.5}
            fill="url(#savingsGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
