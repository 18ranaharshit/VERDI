// Performance: Auth query (Infinity staleTime) + badges query (5min staleTime)
import { useState } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Pencil, Check, X, LogOut, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import GlassCard from '@/components/ui/GlassCard';
import BadgeCard from '@/components/ui/BadgeCard';
import { useAuth } from '@/context/AuthContext';
import { useBadges, useTripStats, useUpdateProfile } from '@/hooks/useTrips';
import { useBalance } from '@/hooks/useCredits';
import { useCountUp } from '@/hooks/useCountUp';
import CreditChip from '@/components/credits/CreditChip';

const container = { animate: { transition: { staggerChildren: 0.05 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { data: badges } = useBadges();
  const { data: stats } = useTripStats();
  const { data: balanceData } = useBalance();
  const updateProfile = useUpdateProfile();

  const [editingInstitution, setEditingInstitution] = useState(false);
  const [institutionValue, setInstitutionValue] = useState(user?.institution || '');

  const totalTrips = useCountUp(stats?.totalTrips || 0);
  const totalSaved = useCountUp(stats?.totalCarbonSaved || 0);
  const streak = useCountUp(stats?.streakDays || 0);
  const balance = useCountUp(balanceData?.balance || 0);

  const handleSaveInstitution = async () => {
    if (!institutionValue.trim()) return;
    try {
      await updateProfile.mutateAsync(institutionValue.trim());
      setEditingInstitution(false);
    } catch {
      // Error handled by mutation
    }
  };

  if (!user) return null;

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        <div className="max-w-[600px] mx-auto">
          {/* Profile Card */}
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard variant="strong" className="p-6 sm:p-8 mb-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-verdi-accent mb-4">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" width={96} height={96} />
                  ) : (
                    <div className="w-full h-full bg-verdi-accent/20 flex items-center justify-center text-3xl">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h2 className="font-display text-2xl font-bold text-verdi-primary">{user.displayName}</h2>
                <p className="text-sm text-verdi-muted mb-3">{user.email}</p>

                {/* Institution */}
                <div className="flex items-center gap-2 mb-4">
                  {editingInstitution ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={institutionValue}
                        onChange={(e) => setInstitutionValue(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-verdi-input border border-verdi-border text-base text-verdi-primary
                                   focus:outline-none focus:border-verdi-accent transition-colors w-48"
                        placeholder="e.g. IIT Nagpur"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveInstitution}
                        disabled={updateProfile.isPending}
                        className="w-8 h-8 rounded-lg bg-verdi-accent/15 text-verdi-accent hover:bg-verdi-accent/25 flex items-center justify-center transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingInstitution(false); setInstitutionValue(user.institution || ''); }}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-[var(--danger)] hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingInstitution(true)}
                      className="flex items-center gap-1.5 text-sm text-verdi-secondary hover:text-verdi-primary transition-colors"
                    >
                      <span>{user.institution || 'Set your institution'}</span>
                      <Pencil className="w-3.5 h-3.5 text-verdi-muted" />
                    </button>
                  )}
                </div>

                {/* Member since */}
                <p className="text-xs text-verdi-muted">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>

                {/* Wallet Link */}
                <Link
                  to="/wallet"
                  className="mt-6 flex items-center justify-between w-full max-w-[240px] px-4 py-3 bg-credit-subtle text-credit rounded-xl hover:bg-credit-subtle/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Wallet size={18} />
                    <span className="font-semibold text-sm">Wallet</span>
                  </div>
                  <CreditChip amount={balance} />
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-verdi-border/50">
                <div className="text-center">
                  <p className="font-mono font-bold text-xl text-verdi-primary">{totalTrips}</p>
                  <p className="text-xs text-verdi-muted">Total Trips</p>
                </div>
                <div className="text-center">
                  <p className="font-mono font-bold text-xl text-verdi-accent">{totalSaved} g</p>
                  <p className="text-xs text-verdi-muted">CO₂ Saved</p>
                </div>
                <div className="text-center">
                  <p className="font-mono font-bold text-xl text-verdi-primary">{streak}</p>
                  <p className="text-xs text-verdi-muted">Day Streak</p>
                </div>
              </div>
            </GlassCard>
          </m.div>

          {/* Badges Grid */}
          {badges && badges.length > 0 && (
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <GlassCard className="p-5 sm:p-6 mb-6">
                <h3 className="font-display font-bold text-lg text-verdi-primary mb-4">All Badges</h3>
                <m.div variants={container} initial="initial" animate="animate" className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                  {badges.map((badge) => (
                    <m.div key={badge.key} variants={item}>
                      <BadgeCard badge={badge} size="md" />
                    </m.div>
                  ))}
                </m.div>
              </GlassCard>
            </m.div>
          )}

          {/* Logout */}
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <button
              onClick={logout}
              className="w-full py-3 rounded-xl border border-[var(--danger)]/30 text-[var(--danger)]
                         font-display font-semibold hover:bg-red-500/10 transition-colors
                         flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </m.div>
        </div>
      </LazyMotion>
    </PageWrapper>
  );
}
