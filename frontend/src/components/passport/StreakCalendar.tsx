// Performance: UI-only component - streak display with fire/flame animation
import { Flame, Star } from 'lucide-react';

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCalendar({ currentStreak, longestStreak }: StreakCalendarProps) {
  return (
    <div className="glass-card p-4 sm:p-6 rounded-xl">
      <h4 className="font-display font-bold text-sm text-verdi-primary mb-4">
        🔥 Green Streaks
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
          <Flame className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="font-mono font-extrabold text-2xl text-amber-600 dark:text-amber-400">
            {currentStreak}
          </p>
          <p className="text-xs text-verdi-muted font-display font-medium">Current Streak</p>
          <p className="text-[10px] text-verdi-muted font-mono">
            {currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
        <div className="text-center p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/20">
          <Star className="w-8 h-8 text-violet-500 mx-auto mb-2" />
          <p className="font-mono font-extrabold text-2xl text-violet-600 dark:text-violet-400">
            {longestStreak}
          </p>
          <p className="text-xs text-verdi-muted font-display font-medium">Longest Streak</p>
          <p className="text-[10px] text-verdi-muted font-mono">
            {longestStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>
    </div>
  );
}
