// Performance: Heavy passport endpoint - staleTime 5min, refetchOnWindowFocus disabled
import { LazyMotion, domAnimation, m } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import GlassCard from '@/components/ui/GlassCard';
import ActivityGrid from '@/components/passport/ActivityGrid';
import CarbonGrade from '@/components/passport/CarbonGrade';
import ProjectionChart from '@/components/passport/ProjectionChart';
import ModeDonut from '@/components/passport/ModeDonut';
import StreakCalendar from '@/components/passport/StreakCalendar';
import PassportStatBlock from '@/components/passport/PassportStatBlock';
import PassportShareCard from '@/components/passport/PassportShareCard';
import PassportSkeleton from '@/skeletons/PassportSkeleton';
import { usePassport } from '@/hooks/usePassport';
import { useAuth } from '@/context/AuthContext';

const container = { animate: { transition: { staggerChildren: 0.05 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function CarbonPassportPage() {
  const { data, isLoading, error } = usePassport();
  const { user } = useAuth();

  if (isLoading || !data) {
    return (
      <PageWrapper>
        <PassportSkeleton />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="glass-card p-6 border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl">
          <h3 className="font-bold text-lg mb-2">Failed to load passport</h3>
          <p>{(error as Error)?.message || 'Please try again later.'}</p>
        </div>
      </PageWrapper>
    );
  }

  const { summary, grade, percentile, activityGrid, weeklyTotals, modeBreakdown, streaks, projection } = data;

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        <m.div variants={container} initial="initial" animate="animate" className="space-y-6">

          {/* Header + Grade */}
          <m.div variants={item} className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-verdi-primary tracking-tight">
                🪪 Carbon Passport
              </h1>
              <p className="text-verdi-muted text-sm mt-1 font-medium">
                Your complete eco-commuting identity
              </p>
              {percentile && (
                <p className="text-xs font-mono mt-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full inline-block">
                  Top {100 - percentile}% at your institution
                </p>
              )}
            </div>
            <CarbonGrade grade={grade} />
          </m.div>

          {/* Summary stat blocks */}
          <m.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PassportStatBlock
              icon="🌱"
              value={(summary.totalCarbonSaved / 1000).toFixed(1)}
              unit="kg"
              label="Total CO₂ Saved"
            />
            <PassportStatBlock
              icon="🚀"
              value={summary.totalTrips}
              label="Eco Commutes"
            />
            <PassportStatBlock
              icon="📏"
              value={summary.totalDistance}
              unit="km"
              label="Total Distance"
            />
            <PassportStatBlock
              icon="🪙"
              value={summary.totalCreditsEarned}
              unit="pts"
              label="Points Earned"
            />
          </m.div>

          {/* Activity Grid */}
          <m.div variants={item}>
            <GlassCard className="p-4 sm:p-6">
              <h3 className="font-display font-bold text-base text-verdi-primary mb-4">
                📊 Activity Grid - Last 365 Days
              </h3>
              <ActivityGrid data={activityGrid} />
            </GlassCard>
          </m.div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <m.div variants={item}>
              <ProjectionChart weeklyTotals={weeklyTotals} milestones={projection.milestones} />
            </m.div>
            <m.div variants={item}>
              <ModeDonut data={modeBreakdown} />
            </m.div>
          </div>

          {/* Streaks */}
          <m.div variants={item}>
            <StreakCalendar
              currentStreak={streaks.currentStreak}
              longestStreak={streaks.longestStreak}
            />
          </m.div>

          {/* Projection details */}
          <m.div variants={item}>
            <GlassCard className="p-4 sm:p-6">
              <h3 className="font-display font-bold text-base text-verdi-primary mb-3">
                🔮 Projection
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-emerald-500/[0.06]">
                  <p className="font-mono font-bold text-xl text-emerald-600 dark:text-emerald-400">
                    {projection.avgDailySavings}g
                  </p>
                  <p className="text-xs text-verdi-muted">avg daily savings</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/[0.06]">
                  <p className="font-mono font-bold text-xl text-emerald-600 dark:text-emerald-400">
                    {(projection.projectedYearlySavings / 1000).toFixed(1)} kg
                  </p>
                  <p className="text-xs text-verdi-muted">projected yearly savings</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/[0.06]">
                  <p className="font-mono font-bold text-xl text-emerald-600 dark:text-emerald-400">
                    {Math.round(projection.projectedYearlySavings / 21)}
                  </p>
                  <p className="text-xs text-verdi-muted">🌳 trees equivalent</p>
                </div>
              </div>

              {/* Milestones */}
              <div className="mt-4 pt-4 border-t border-verdi-border/30">
                <p className="text-xs font-display font-bold text-verdi-muted uppercase tracking-wider mb-2">
                  Milestones
                </p>
                <div className="flex flex-wrap gap-2">
                  {projection.milestones.map((m) => (
                    <span
                      key={m.label}
                      className={`text-xs font-mono px-3 py-1.5 rounded-full ${m.daysAway === 0
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-verdi-subtle text-verdi-muted'
                        }`}
                    >
                      {m.daysAway === 0 ? '✅' : '🎯'} {m.label}
                      {m.daysAway !== null && m.daysAway > 0 && ` (~${m.daysAway}d)`}
                      {m.daysAway === null && ' (keep going!)'}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          </m.div>

          {/* Share Card */}
          <m.div variants={item}>
            <GlassCard className="p-4 sm:p-6">
              <h3 className="font-display font-bold text-base text-verdi-primary mb-4">
                📸 Share Your Carbon Passport
              </h3>
              <div className="flex justify-center overflow-x-auto">
                <PassportShareCard data={data} displayName={user?.displayName || 'Eco Commuter'} />
              </div>
            </GlassCard>
          </m.div>
        </m.div>
      </LazyMotion>
    </PageWrapper>
  );
}
