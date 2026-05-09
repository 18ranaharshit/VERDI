// Performance: SVG-based activity grid - 53×7 rects with CSS animation-delay wave entrance
import type { ActivityDay } from '@/types';

function getIntensityColor(carbonSaved: number): string {
  if (carbonSaved === 0) return 'var(--grid-empty)';
  if (carbonSaved < 50) return 'var(--grid-low)';
  if (carbonSaved < 150) return 'var(--grid-mid)';
  if (carbonSaved < 300) return 'var(--grid-high)';
  return 'var(--grid-max)';
}

interface ActivityGridProps {
  data: ActivityDay[];
}

export default function ActivityGrid({ data }: ActivityGridProps) {
  // Pad to 371 days (53 weeks × 7 days) aligning to start on Sunday
  const days = [...data];

  // Determine the start day of week for the first date
  const firstDate = days.length > 0 ? new Date(days[0].date) : new Date();
  const startDayOfWeek = firstDate.getDay(); // 0 = Sunday

  // Prepend empty days to align to Sunday
  const paddedDays: (ActivityDay | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    paddedDays.push(null);
  }
  days.forEach((d) => paddedDays.push(d));

  const cellSize = 11;
  const gap = 2;
  const totalCols = Math.ceil(paddedDays.length / 7);
  const svgWidth = totalCols * (cellSize + gap) + 30; // extra space for day labels
  const svgHeight = 7 * (cellSize + gap) + 20; // extra space for month labels

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Get month labels
  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;
  paddedDays.forEach((day, i) => {
    if (!day) return;
    const d = new Date(day.date);
    const month = d.getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      const col = Math.floor(i / 7);
      months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), col });
    }
  });

  return (
    <div className="overflow-x-auto hide-scrollbar">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="block"
        role="img"
        aria-label="Activity contribution grid showing carbon savings over the past year"
      >
        {/* Month labels */}
        {months.map((m, i) => (
          <text
            key={i}
            x={30 + m.col * (cellSize + gap)}
            y={10}
            className="fill-current text-verdi-muted"
            style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace' }}
          >
            {m.label}
          </text>
        ))}

        {/* Day labels */}
        {dayLabels.map((label, i) => (
          <text
            key={i}
            x={0}
            y={20 + i * (cellSize + gap) + cellSize - 2}
            className="fill-current text-verdi-muted"
            style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace' }}
          >
            {label}
          </text>
        ))}

        {/* Grid cells */}
        {paddedDays.map((day, i) => {
          const col = Math.floor(i / 7);
          const row = i % 7;
          const x = 30 + col * (cellSize + gap);
          const y = 18 + row * (cellSize + gap);

          if (!day) {
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill="transparent"
              />
            );
          }

          const color = getIntensityColor(day.carbonSaved);

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={color}
              className="grid-cell"
              style={{ animationDelay: `${col * 10}ms` }}
            >
              <title>{day.date}: {day.carbonSaved}g CO₂ saved</title>
            </rect>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 justify-end">
        <span className="text-[10px] text-verdi-muted font-mono">Less</span>
        {['var(--grid-empty)', 'var(--grid-low)', 'var(--grid-mid)', 'var(--grid-high)', 'var(--grid-max)'].map((color, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
        ))}
        <span className="text-[10px] text-verdi-muted font-mono">More</span>
      </div>
    </div>
  );
}
