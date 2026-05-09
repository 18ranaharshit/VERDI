// Performance: Recharts horizontal bar chart - imported at page level via lazy load
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import GlassCard from '@/components/ui/GlassCard';

interface EmissionsByModeChartProps {
  data: Record<string, number>;
}

const MODE_COLORS: Record<string, string> = {
  car: '#EF4444',
  motorcycle: '#F97316',
  bus: '#EAB308',
  electric_car: '#06B6D4',
  cycling: '#10B981',
  walking: '#8B5CF6',
};

const MODE_LABELS: Record<string, string> = {
  car: 'Car',
  motorcycle: 'Motorcycle',
  bus: 'Bus',
  electric_car: 'Electric',
  cycling: 'Cycling',
  walking: 'Walking',
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-strong p-3 text-sm">
      <p className="font-display font-semibold text-verdi-primary">{payload[0].payload.name}</p>
      <p className="font-mono text-verdi-accent">{payload[0].value.toLocaleString()} g CO₂</p>
    </div>
  );
}

export default function EmissionsByModeChart({ data }: EmissionsByModeChartProps) {
  const width = useWindowWidth();
  const chartHeight = width < 640 ? 200 : 260;

  const chartData = Object.entries(data)
    .map(([mode, value]) => ({
      mode,
      name: MODE_LABELS[mode] || mode,
      value: Math.round(value),
      color: MODE_COLORS[mode] || '#10B981',
    }))
    .sort((a, b) => b.value - a.value);

  const displayData = width < 640 ? chartData.slice(0, 3) : chartData;

  if (displayData.length === 0) {
    return (
      <GlassCard className="p-4 sm:p-6">
        <h3 className="font-display font-bold text-lg text-verdi-primary mb-4">
          Emissions by Transport Mode
        </h3>
        <p className="text-verdi-muted text-sm">Log trips to see your emissions breakdown.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 sm:p-6">
      <h3 className="font-display font-bold text-lg text-verdi-primary mb-4">
        Emissions by Transport Mode
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={displayData} layout="vertical" margin={{ left: 10, right: 30 }}>
          <XAxis
            type="number"
            tick={{ fontSize: 11, fontFamily: 'DM Mono', fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans', fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={1200} maxBarSize={48}>
            {displayData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
