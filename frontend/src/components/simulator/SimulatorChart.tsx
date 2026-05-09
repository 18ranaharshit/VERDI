// Performance: Recharts donut with responsive container - lightweight render for mode split
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MODE_COLORS: Record<string, string> = {
  car: '#EF4444',
  cycling: '#10B981',
  walking: '#8B5CF6',
  bus: '#EAB308',
  electric: '#06B6D4',
};

interface SimulatorChartProps {
  pctCycling: number;
  pctWalking: number;
  pctBus: number;
  pctElectric: number;
}

export default function SimulatorChart({ pctCycling, pctWalking, pctBus, pctElectric }: SimulatorChartProps) {
  const pctCar = Math.max(0, 100 - pctCycling - pctWalking - pctBus - pctElectric);

  const data = [
    { name: 'Car', value: pctCar, color: MODE_COLORS.car },
    { name: 'Cycling', value: pctCycling, color: MODE_COLORS.cycling },
    { name: 'Walking', value: pctWalking, color: MODE_COLORS.walking },
    { name: 'Bus', value: pctBus, color: MODE_COLORS.bus },
    { name: 'Electric', value: pctElectric, color: MODE_COLORS.electric },
  ].filter((d) => d.value > 0);

  return (
    <div className="glass-card p-4 rounded-xl">
      <h4 className="font-display font-bold text-sm text-verdi-primary text-center mb-3">
        Transport Mode Split
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [`${value}%`, '']}
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
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] font-display font-semibold text-verdi-muted">
              {d.name} {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
