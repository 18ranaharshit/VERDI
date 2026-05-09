// Performance: UI-only component - glass navbar with sidebar on desktop, slide-in sheet on mobile
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, User, Coins, Gift, Ticket, LayoutDashboard, Calculator, History, Trophy, Map, Globe, Award } from 'lucide-react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import CreditBalance from '@/components/credits/CreditBalance';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/history', label: 'History', icon: History },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const REWARD_LINKS = [
  { to: '/wallet', label: 'Wallet', icon: Coins },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/vouchers', label: 'My Vouchers', icon: Ticket },
];

const INSIGHT_LINKS = [
  { to: '/planner', label: 'Route Planner', icon: Map },
  { to: '/simulator', label: 'Simulator', icon: Globe },
  { to: '/passport', label: 'Passport', icon: Award },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <LazyMotion features={domAnimation}>
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 dark:bg-[#022c22]/95 backdrop-blur-md rounded-none h-16 border-b border-verdi-border">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-verdi-primary leading-tight">Verdi</span>
              <span className="text-[10px] font-medium text-verdi-muted leading-none hidden sm:block">Eco Commuter</span>
            </div>
          </Link>

          {/* Desktop Nav - hidden, sidebar handles it */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-4 py-2 font-display font-semibold uppercase tracking-widest text-xs text-verdi-secondary hover:text-verdi-primary transition-colors"
                >
                  {link.label}
                  {isActive && (
                    <m.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-verdi-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:block mr-2">
                <CreditBalance />
              </div>
            )}
            <ThemeToggle />

            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-verdi-accent/40 hover:border-verdi-accent transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" width={36} height={36} />
                  ) : (
                    <div className="w-full h-full bg-verdi-accent/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-verdi-accent" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <m.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 top-12 glass-card-strong p-4 w-56 z-50"
                    >
                      <p className="font-display font-semibold text-sm text-verdi-primary truncate">{user.displayName}</p>
                      <p className="text-xs text-verdi-muted truncate mb-3">{user.email}</p>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-verdi-secondary hover:text-verdi-primary hover:bg-verdi-subtle rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--danger)] hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden glass-button w-10 h-10 rounded-xl flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-verdi-primary" />
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-60 z-40 glass-card rounded-none border-t-0 border-b-0 border-l-0 flex-col p-4 pt-6 gap-1">
        <p className="text-[10px] font-display font-bold text-verdi-muted uppercase tracking-[0.15em] px-4 mb-2">Main</p>
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 flex items-center gap-3
                ${isActive
                  ? 'bg-verdi-accent/15 text-verdi-accent shadow-sm'
                  : 'text-verdi-secondary hover:text-verdi-primary hover:bg-verdi-subtle'
                }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {link.label}
            </Link>
          );
        })}

        <div className="my-3 h-px bg-verdi-border/50 mx-4" />
        <p className="text-[10px] font-display font-bold text-verdi-muted uppercase tracking-[0.15em] px-4 mb-2">Rewards</p>

        {REWARD_LINKS.map((link) => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 flex items-center gap-3
                ${isActive
                  ? 'bg-credit-subtle text-credit shadow-sm'
                  : 'text-verdi-secondary hover:text-credit hover:bg-credit-subtle'
                }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {link.label}
            </Link>
          );
        })}

        <div className="my-3 h-px bg-verdi-border/50 mx-4" />
        <p className="text-[10px] font-display font-bold text-verdi-muted uppercase tracking-[0.15em] px-4 mb-2">Insights</p>

        {INSIGHT_LINKS.map((link) => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 flex items-center gap-3
                ${isActive
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-verdi-secondary hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/[0.06]'
                }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {link.label}
            </Link>
          );
        })}

        <div className="mt-auto">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-verdi-secondary hover:text-verdi-primary hover:bg-verdi-subtle transition-all"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" width={32} height={32} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-verdi-accent/20 flex items-center justify-center">
                <User className="w-4 h-4 text-verdi-accent" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.displayName}</p>
              <p className="text-xs text-verdi-muted truncate">{user?.institution || 'Set institution'}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile slide-in sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 z-50 glass-card-strong rounded-none border-r-0 p-6 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end mb-6 w-10 h-10 rounded-xl glass-button flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-verdi-primary" />
              </button>

              {user && (
                <div className="mb-6">
                  <CreditBalance />
                </div>
              )}

              <p className="text-[10px] font-display font-bold text-verdi-muted uppercase tracking-[0.15em] px-4 mb-2">Main</p>
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 min-h-[52px] flex items-center gap-3 rounded-xl font-display font-semibold text-sm transition-all mb-1
                      ${isActive
                        ? 'bg-verdi-accent/15 text-verdi-accent'
                        : 'text-verdi-secondary hover:text-verdi-primary hover:bg-verdi-subtle'
                      }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-2 h-px bg-verdi-border/50 mx-4" />
              <p className="text-[10px] font-display font-bold text-verdi-muted uppercase tracking-[0.15em] px-4 mb-2">Rewards</p>

              {REWARD_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 min-h-[52px] flex items-center gap-3 rounded-xl font-display font-semibold text-sm transition-all mb-1
                      ${isActive
                        ? 'bg-credit-subtle text-credit'
                        : 'text-verdi-secondary hover:text-credit hover:bg-credit-subtle'
                      }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-2 h-px bg-verdi-border/50 mx-4" />
              <p className="text-[10px] font-display font-bold text-verdi-muted uppercase tracking-[0.15em] px-4 mb-2">Insights</p>

              {INSIGHT_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 min-h-[52px] flex items-center gap-3 rounded-xl font-display font-semibold text-sm transition-all mb-1
                      ${isActive
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                        : 'text-verdi-secondary hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/[0.06]'
                      }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-auto border-t border-verdi-border pt-4">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-verdi-secondary hover:text-verdi-primary hover:bg-verdi-subtle transition-all"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[var(--danger)] hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
