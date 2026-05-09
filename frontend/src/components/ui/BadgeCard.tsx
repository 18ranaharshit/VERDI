// Performance: UI-only component - lightweight badge display with earned/locked states
import type { Badge } from '@/types';
import GlassCard from './GlassCard';

interface BadgeCardProps {
  badge: Badge;
  size?: 'sm' | 'md';
}

export default function BadgeCard({ badge, size = 'sm' }: BadgeCardProps) {
  const isEarned = badge.earned;
  const sizePx = size === 'sm' ? 'w-20 h-24' : 'w-28 h-32';

  return (
    <div className="relative group" title={badge.desc}>
      <GlassCard
        className={`${sizePx} flex flex-col items-center justify-center gap-1 p-2
                    transition-all duration-300 hover:-translate-y-1
                    ${isEarned
                      ? 'hover:shadow-lg hover:shadow-emerald-500/15 border-emerald-500/20'
                      : 'opacity-35 grayscale'}`}
        style={isEarned ? { borderColor: 'rgba(5, 150, 105, 0.25)' } : undefined}
      >
        <span className={`${size === 'sm' ? 'text-2xl' : 'text-3xl'} transition-transform group-hover:scale-110`}>
          {badge.icon}
        </span>
        <span className={`text-[10px] font-display font-semibold text-center leading-tight
          ${isEarned ? 'text-emerald-700 dark:text-emerald-400' : 'text-verdi-muted'}`}>
          {badge.label}
        </span>
      </GlassCard>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white dark:bg-verdi-bg shadow-xl border border-verdi-border rounded-xl
                      text-xs text-verdi-primary whitespace-nowrap opacity-0 group-hover:opacity-100
                      transition-opacity duration-200 pointer-events-none z-[100]">
        <p className="font-display font-semibold">{badge.label}</p>
        <p className="text-verdi-muted">{badge.desc}</p>
        {isEarned && badge.earnedAt && (
          <p className="text-emerald-600 dark:text-emerald-400 text-[10px] mt-0.5">
            Earned {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
