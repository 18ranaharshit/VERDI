// Performance: Recharts AreaChart for projection visualization with milestone markers
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ProjectionChartProps {
  weeklyTotals: Array<{ week: string; carbonSaved: number; trips: number }>;
  milestones: Array<{ label: string; targetGrams: number; daysAway: number | null }>;
}

export default function ProjectionChart({ weeklyTotals, milestones }: ProjectionChartProps) {
  // Build cumulative data
  let cumulative = 0;
  const chartData = weeklyTotals.map((w) => {
    cumulative += w.carbonSaved;
    return {
      week: w.week.replace(/^\d{4}-/, ''),
      saved: Math.round(cumulative),
      trips: w.trips,
    };
  });

  // Find the next unachieved milestone for reference line
  const nextMilestone = milestones.find((m) => m.daysAway !== 0 && m.daysAway !== null);

  return (
    <div className="glass-card p-4 sm:p-6 rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h4 className="font-display font-bold text-sm text-verdi-primary">
          📈 Carbon Savings Projection
        </h4>
        {nextMilestone && (
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">
            {nextMilestone.label} in ~{nextMilestone.daysAway}d
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="gradientSaved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fontFamily: 'DM Mono' }}
            stroke="var(--text-muted)"
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'DM Mono' }}
            stroke="var(--text-muted)"
            tickFormatter={(v) => `${v}g`}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '12px',
              fontFamily: 'DM Mono',
            }}
            formatter={(value: any) => [`${value}g CO₂`, 'Cumulative Saved']}
          />
          {/* Milestone reference lines */}
          {milestones.map((m) => (
            <ReferenceLine
              key={m.label}
              y={m.targetGrams}
              stroke={m.daysAway === 0 ? '#10B981' : '#94A3B8'}
              strokeDasharray="4 4"
              label={{
                value: m.label,
                position: 'insideTopRight',
                fill: 'var(--text-muted)',
                fontSize: 10,
                fontFamily: 'DM Mono',
              }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="saved"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#gradientSaved)"
            dot={false}
            activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
