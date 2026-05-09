// Performance: Recharts PieChart for mode breakdown - lightweight donut
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getModeInfo } from '@/utils/carbon';
import type { TransportMode } from '@/types';

const MODE_COLORS: Record<string, string> = {
  car: '#EF4444',
  motorcycle: '#F97316',
  bus: '#EAB308',
  electric_car: '#06B6D4',
  cycling: '#10B981',
  walking: '#8B5CF6',
};

interface ModeDonutProps {
  data: Array<{ mode: string; totalCarbonSaved: number; tripCount: number }>;
}

export default function ModeDonut({ data }: ModeDonutProps) {
  const chartData = data.map((d) => ({
    name: getModeInfo(d.mode as TransportMode).label,
    value: d.tripCount,
    color: MODE_COLORS[d.mode] || '#94A3B8',
    mode: d.mode,
    saved: d.totalCarbonSaved,
  }));

  return (
    <div className="glass-card p-4 sm:p-6 rounded-xl">
      <h4 className="font-display font-bold text-sm text-verdi-primary mb-3">
        🚀 Mode Breakdown
      </h4>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, _: any, props: any) => [
              `${value} trips (${props.payload.saved}g saved)`,
              props.payload.name,
            ]}
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '12px',
              fontFamily: 'DM Mono',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {chartData.map((d) => (
          <div key={d.mode} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] font-display font-semibold text-verdi-muted">
              {d.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
