// Performance: Leaderboard data refetches every 2 min - aggregation pipeline on backend
import { useState } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Trophy, Medal, User } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import GlassCard from '@/components/ui/GlassCard';
import { useLeaderboard } from '@/hooks/useTrips';
import { useWindowWidth } from '@/hooks/useWindowWidth';

const container = { animate: { transition: { staggerChildren: 0.04 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const PODIUM_HEIGHTS = ['h-40', 'h-32', 'h-24'];
const PODIUM_ORDER = [1, 0, 2]; // 2nd, 1st, 3rd

export default function LeaderboardPage() {
  const [institution, setInstitution] = useState('');
  const { data: leaderboard, isLoading } = useLeaderboard(institution || undefined);
  const width = useWindowWidth();
  const isDesktop = width >= 1024;

  const top3 = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        <div className="max-w-[720px] mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-7 h-7 text-amber-500" />
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-verdi-primary tracking-tight">
              Carbon Champions
            </h1>
          </div>

          {/* Institution filter */}
          <div className="mb-6">
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Filter by institution..."
              className="w-full px-4 py-3 rounded-xl bg-verdi-input border border-verdi-border
                         text-base text-verdi-primary placeholder:text-verdi-muted
                         focus:outline-none focus:border-verdi-accent focus:ring-1 focus:ring-verdi-glow
                         transition-all duration-200"
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass-card h-16 skeleton-shimmer rounded-2xl" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && (!leaderboard || leaderboard.length === 0) && (
            <GlassCard className="p-8 text-center">
              <Trophy className="w-12 h-12 text-verdi-muted/40 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-verdi-primary mb-1">No champions yet</h3>
              <p className="text-verdi-muted text-sm">Be the first to log an verdi-friendly trip!</p>
            </GlassCard>
          )}

          {/* Top 3 Podium (desktop) */}
          {!isLoading && top3.length > 0 && isDesktop && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end justify-center gap-4 mb-8">
              {PODIUM_ORDER.map((idx) => {
                const entry = top3[idx];
                if (!entry) {
                  return <div key={`empty-${idx}`} className="w-28 flex flex-col items-center justify-end" style={{ height: idx === 1 ? '180px' : '150px' }} />;
                }
                return (
                  <m.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-3 bg-verdi-card"
                        style={{ borderColor: MEDAL_COLORS[idx] }}>
                        {entry.avatar ? (
                          <img src={entry.avatar} alt={entry.displayName} className="w-full h-full object-cover" width={64} height={64} />
                        ) : (
                          <div className="w-full h-full bg-verdi-card flex items-center justify-center">
                            <User className="w-6 h-6 text-verdi-muted" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold text-white shadow-md"
                        style={{ backgroundColor: MEDAL_COLORS[idx] }}>
                        {idx + 1}
                      </div>
                    </div>
                    <p className="font-display font-semibold text-sm text-verdi-primary text-center truncate w-full max-w-[120px]">
                      {entry.displayName}
                    </p>
                    {entry.institution && (
                      <p className="text-[10px] text-verdi-muted truncate max-w-[120px]">{entry.institution}</p>
                    )}
                    <GlassCard className={`w-28 ${PODIUM_HEIGHTS[idx]} mt-2 flex flex-col items-center justify-center`}
                      style={{ boxShadow: `0 0 20px ${MEDAL_COLORS[idx]}20` }}>
                      <span className="font-mono font-bold text-lg text-verdi-primary">{entry.totalCarbonSaved}</span>
                      <span className="text-[10px] text-verdi-muted text-center leading-tight">kg saved</span>
                    </GlassCard>
                  </m.div>
                );
              })}
            </m.div>
          )}

          {/* Mobile Top 3 + Ranks 4-20 as list */}
          {!isLoading && leaderboard && leaderboard.length > 0 && (
            <m.div variants={container} initial="initial" animate="animate" className="space-y-2">
              {(isDesktop ? rest : leaderboard).map((entry) => (
                <m.div key={entry.userId} variants={item}>
                  <GlassCard
                    className={`p-3 sm:p-4 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200
                      ${entry.isCurrentUser ? 'ring-1 ring-verdi-accent' : ''}`}
                    style={entry.isCurrentUser ? { backgroundColor: 'var(--accent-subtle)' } : {}}
                  >
                    {/* Rank */}
                    <div className="w-8 flex-shrink-0 text-center">
                      {entry.rank <= 3 ? (
                        <Medal className="w-5 h-5 mx-auto" style={{ color: MEDAL_COLORS[entry.rank - 1] }} />
                      ) : (
                        <span className="font-mono font-bold text-sm text-verdi-muted">{entry.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-verdi-border">
                      {entry.avatar ? (
                        <img src={entry.avatar} alt={entry.displayName} className="w-full h-full object-cover" width={40} height={40} />
                      ) : (
                        <div className="w-full h-full bg-verdi-card flex items-center justify-center">
                          <User className="w-4 h-4 text-verdi-muted" />
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-display font-semibold text-verdi-primary truncate">
                          {entry.displayName}
                        </p>
                        {entry.isCurrentUser && (
                          <span className="text-[10px] font-mono bg-verdi-accent text-white px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                      {entry.institution && (
                        <p className="text-xs text-verdi-muted truncate">{entry.institution}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-sm text-verdi-primary">{entry.totalCarbonSaved} kg</p>
                      <p className="text-xs text-verdi-muted">{entry.totalTrips} trips</p>
                    </div>
                  </GlassCard>
                </m.div>
              ))}
            </m.div>
          )}
        </div>
      </LazyMotion>
    </PageWrapper>
  );
}
