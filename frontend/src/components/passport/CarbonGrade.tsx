// Performance: UI-only component - grade badge with color coding
interface CarbonGradeProps {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
}

const GRADE_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  'A+': { color: 'var(--grade-aplus)', bg: 'rgba(16, 185, 129, 0.12)', label: 'Exceptional' },
  'A': { color: 'var(--grade-a)', bg: 'rgba(52, 211, 153, 0.12)', label: 'Excellent' },
  'B': { color: 'var(--grade-b)', bg: 'rgba(6, 182, 212, 0.12)', label: 'Good' },
  'C': { color: 'var(--grade-c)', bg: 'rgba(245, 158, 11, 0.12)', label: 'Improving' },
  'D': { color: 'var(--grade-d)', bg: 'rgba(239, 68, 68, 0.12)', label: 'Getting Started' },
};

export default function CarbonGrade({ grade }: CarbonGradeProps) {
  const style = GRADE_STYLES[grade] || GRADE_STYLES.D;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
        style={{
          background: style.bg,
          border: `2px solid ${style.color}`,
          boxShadow: `0 8px 24px ${style.color}33`,
        }}
      >
        <span
          className="font-display font-extrabold text-3xl"
          style={{ color: style.color }}
        >
          {grade}
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs font-display font-bold text-verdi-primary uppercase tracking-wider">
          Carbon Grade
        </p>
        <p className="text-[11px] font-medium" style={{ color: style.color }}>
          {style.label}
        </p>
      </div>
    </div>
  );
}
