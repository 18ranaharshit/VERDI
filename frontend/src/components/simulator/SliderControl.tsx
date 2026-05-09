// Performance: UI-only component - styled range slider with live value display
interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  color: string;
  icon: string;
}

export default function SliderControl({
  label, value, onChange, min = 0, max = 100, step = 1, unit = '%', color, icon,
}: SliderControlProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-display font-semibold text-sm text-verdi-primary">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono font-bold text-lg" style={{ color }}>
            {value}
          </span>
          <span className="text-xs text-verdi-muted font-medium">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider w-full"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--bg-tertiary) ${pct}%, var(--bg-tertiary) 100%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-verdi-muted font-mono">{min}{unit}</span>
        <span className="text-[10px] text-verdi-muted font-mono">{max}{unit}</span>
      </div>
    </div>
  );
}
