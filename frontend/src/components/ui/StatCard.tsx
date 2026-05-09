// Performance: UI-only component - uses useCountUp for animated number display
import { type ReactNode } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import GlassCard from './GlassCard';

interface StatCardProps {
  icon: ReactNode;
  value: number;
  suffix?: string;
  label: string;
  iconBgColor?: string;
  trend?: { value: number; isUp: boolean };
}

export default function StatCard({ icon, value, suffix = '', label, iconBgColor = 'bg-verdi-accent/15', trend }: StatCardProps) {
  const animatedValue = useCountUp(value);

  return (
    <GlassCard className="p-4 sm:p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 min-w-[180px] group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${trend.isUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
            }`}>
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="font-mono text-2xl sm:text-3xl font-bold text-verdi-primary tracking-tight">
        {animatedValue.toLocaleString()}
        {suffix && <span className="text-base font-normal text-verdi-muted ml-1">{suffix}</span>}
      </div>
      <p className="text-sm text-verdi-muted mt-1 font-medium">{label}</p>
    </GlassCard>
  );
}
