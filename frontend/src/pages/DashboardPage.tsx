// Performance: Stats query staleTime 5min, trip list staleTime 1min - lazy-loaded charts
import { Link } from 'react-router-dom';
import { Leaf, Route, Flame, MapPin } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import StatCard from '@/components/ui/StatCard';
import GlassCard from '@/components/ui/GlassCard';
import BadgeCard from '@/components/ui/BadgeCard';
import SavingsLineChart from '@/components/charts/SavingsLineChart';
import EmissionsByModeChart from '@/components/charts/EmissionsByModeChart';
import { useTripStats, useTrips, useBadges, useLeaderboard } from '@/hooks/useTrips';
import { useBalance } from '@/hooks/useCredits';
import { getModeInfo } from '@/utils/carbon';
import { useCountUp } from '@/hooks/useCountUp';
import { useAuth } from '@/context/AuthContext';
import { LazyMotion, domAnimation, m } from 'framer-motion';

const container = { animate: { transition: { staggerChildren: 0.05 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useTripStats();
  const { data: tripsData } = useTrips(1, 5);
  const { data: badges } = useBadges();
  const { data: balanceData } = useBalance();
  const { data: leaderboard } = useLeaderboard();
  const { user } = useAuth();

  const animatedBalance = useCountUp(balanceData?.balance || 0);
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  if (statsError) {
    return (
      <PageWrapper>
        <div className="glass-card p-6 border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-mono text-sm rounded-xl">
          <h3 className="font-bold text-lg mb-2">API Connection Error</h3>
          <p>{statsError.message || 'Unknown error occurred.'}</p>
          <p className="mt-4 text-xs opacity-70">
            Ensure VITE_API_BASE_URL is set correctly in Vercel and the Render backend is running.
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (statsLoading || !stats) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <div className="h-10 w-64 skeleton-shimmer rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-5 h-32 skeleton-shimmer rounded-2xl" />
            ))}
          </div>
          <div className="glass-card h-72 skeleton-shimmer rounded-2xl" />
        </div>
      </PageWrapper>
    );
  }

  const recentTrips = tripsData?.trips || [];
  const earnedBadges = badges?.filter((b) => b.earned).length || 0;

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        <m.div variants={container} initial="initial" animate="animate" className="space-y-6">

          {/* Personalized Greeting */}
          <m.div variants={item}>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-verdi-primary tracking-tight">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="text-verdi-muted text-sm mt-1 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </m.div>

          {/* Quick Wallet Banner */}
          <m.div variants={item}>
            <Link to="/wallet" className="glass-card-gold flex items-center justify-between p-4 sm:p-5 group hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🪙</span>
                </div>
                <div>
                  <p className="text-amber-700 dark:text-amber-400 font-bold text-xs tracking-widest uppercase mb-1">Carbon Wallet</p>
                  <p className="font-mono font-bold text-2xl text-verdi-primary leading-none">{animatedBalance} <span className="text-base text-amber-600 dark:text-amber-400">points</span></p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 group-hover:shadow-xl transition-shadow">
                Redeem Rewards
              </div>
            </Link>
          </m.div>

          {/* Hero Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
            <m.div variants={item}>
              <StatCard
                icon={<Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                value={stats.totalCarbonSaved}
                suffix="g"
                label="Carbon Saved vs Driving"
                iconBgColor="bg-emerald-500/15"
              />
            </m.div>
            <m.div variants={item}>
              <StatCard
                icon={<Route className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
                value={stats.totalTrips}
                label="Eco Commutes Logged"
                iconBgColor="bg-cyan-500/15"
              />
            </m.div>
            <m.div variants={item}>
              <StatCard
                icon={<Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                value={stats.streakDays}
                suffix=" days"
                label="Consecutive Green Days"
                iconBgColor="bg-amber-500/15"
              />
            </m.div>
            <m.div variants={item}>
              <StatCard
                icon={<MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
                value={stats.totalDistanceGreen}
                suffix=" km"
                label="Without a Private Vehicle"
                iconBgColor="bg-violet-500/15"
              />
            </m.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <m.div variants={item}>
              <SavingsLineChart data={stats.tripsOverTime} />
            </m.div>
            <m.div variants={item}>
              <EmissionsByModeChart data={stats.co2ByMode} />
            </m.div>
          </div>

          {/* Lower Grid: Recent Trips & Mini Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Trips */}
            <m.div variants={item} className="flex flex-col">
              <GlassCard className="p-4 sm:p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg text-verdi-primary">Recent Commutes</h3>
                  <Link to="/history" className="text-sm text-verdi-accent hover:text-verdi-accent/80 font-display font-semibold transition-colors">
                    View All →
                  </Link>
                </div>

                {recentTrips.length === 0 ? (
                  <p className="text-verdi-muted text-sm py-8 text-center">No trips logged yet. Start with the Calculator!</p>
                ) : (
                  <div className="space-y-2">
                    {recentTrips.map((trip) => {
                      const modeInfo = getModeInfo(trip.transportMode);
                      return (
                        <div key={trip._id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `color-mix(in srgb, ${modeInfo.color} 15%, transparent)` }}>
                            <span className="text-lg">{modeInfo.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-display font-semibold text-verdi-primary truncate">
                              {trip.origin} → {trip.destination}
                            </p>
                            <p className="text-xs text-verdi-muted">
                              {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-mono text-verdi-primary">{trip.carbonEmitted} g CO₂</p>
                            {trip.carbonSaved > 0 && (
                              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">+{trip.carbonSaved} g saved</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </m.div>

            {/* Mini Leaderboard */}
            <m.div variants={item} className="flex flex-col">
              <GlassCard className="p-4 sm:p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg text-verdi-primary">Top Savers</h3>
                  <Link to="/leaderboard" className="text-sm text-verdi-accent hover:text-verdi-accent/80 font-display font-semibold transition-colors">
                    Leaderboard →
                  </Link>
                </div>

                {!leaderboard ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 skeleton-shimmer rounded-lg" />
                    ))}
                  </div>
                ) : leaderboard.length === 0 ? (
                  <p className="text-verdi-muted text-sm py-8 text-center">No champions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 4).map((entry) => (
                      <div key={entry.userId} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors
                        ${entry.isCurrentUser ? 'bg-emerald-500/8 ring-1 ring-emerald-500/20' : 'hover:bg-white/40 dark:hover:bg-white/5'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs
                          ${entry.rank === 1 ? 'bg-amber-500/15 text-amber-600' :
                            entry.rank === 2 ? 'bg-gray-400/15 text-gray-500' :
                            entry.rank === 3 ? 'bg-orange-500/15 text-orange-600' :
                            'bg-verdi-subtle text-verdi-muted'}`}>
                          {entry.rank}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-verdi-card overflow-hidden flex-shrink-0 border border-verdi-border">
                          {entry.avatar ? (
                            <img src={entry.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-verdi-muted/20" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display font-semibold text-verdi-primary truncate">
                            {entry.displayName}
                            {entry.isCurrentUser && <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ml-1.5 px-1.5 py-0.5 rounded font-mono">You</span>}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono font-bold text-sm text-verdi-primary">{entry.totalCarbonSaved} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </m.div>
          </div>

          {/* Badges Row */}
          {badges && badges.length > 0 && (
            <m.div variants={item}>
              <GlassCard className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-display font-bold text-lg text-verdi-primary">Achievements</h3>
                  <span className="text-xs font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    {earnedBadges}/{badges.length}
                  </span>
                </div>
                {/* Changed from overflow-x-auto to flex-wrap to prevent clipping of tooltips */}
                <div className="flex flex-wrap gap-3 pb-2 pt-1">
                  {badges.map((badge) => (
                    <BadgeCard key={badge.key} badge={badge} />
                  ))}
                </div>
              </GlassCard>
            </m.div>
          )}

          {/* Insights Suite Teaser Cards */}
          <m.div variants={item}>
            <GlassCard className="p-4 sm:p-6">
              <h3 className="font-display font-bold text-lg text-verdi-primary mb-4">
                🧭 Insights Suite
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to="/planner"
                  className="p-4 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 hover:bg-cyan-500/10 hover:shadow-md transition-all group"
                >
                  <span className="text-2xl block mb-2">🗺️</span>
                  <p className="font-display font-bold text-sm text-verdi-primary group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Route Planner
                  </p>
                  <p className="text-xs text-verdi-muted mt-0.5">Compare 6 modes side-by-side</p>
                </Link>
                <Link
                  to="/simulator"
                  className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 hover:bg-emerald-500/10 hover:shadow-md transition-all group"
                >
                  <span className="text-2xl block mb-2">🎛️</span>
                  <p className="font-display font-bold text-sm text-verdi-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Campus Simulator
                  </p>
                  <p className="text-xs text-verdi-muted mt-0.5">Model campus-wide impact</p>
                </Link>
                <Link
                  to="/passport"
                  className="p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/20 hover:bg-violet-500/10 hover:shadow-md transition-all group"
                >
                  <span className="text-2xl block mb-2">🪪</span>
                  <p className="font-display font-bold text-sm text-verdi-primary group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Carbon Passport
                  </p>
                  <p className="text-xs text-verdi-muted mt-0.5">Your eco-commuting identity</p>
                </Link>
              </div>
            </GlassCard>
          </m.div>
        </m.div>
      </LazyMotion>
    </PageWrapper>
  );
}
