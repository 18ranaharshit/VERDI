// Performance: UI-only component - reusable stat block for passport page
interface PassportStatBlockProps {
  icon: string;
  value: string | number;
  unit?: string;
  label: string;
}

export default function PassportStatBlock({ icon, value, unit = '', label }: PassportStatBlockProps) {
  return (
    <div className="glass-card p-4 rounded-xl text-center hover:shadow-md transition-shadow">
      <span className="text-2xl block mb-1.5">{icon}</span>
      <p className="font-mono font-bold text-xl text-verdi-primary">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-sm text-verdi-muted ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-verdi-muted font-display font-medium mt-0.5">{label}</p>
    </div>
  );
}
