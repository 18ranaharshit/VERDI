// Performance: UI-only component - fixed bottom tab bar for mobile with 44px touch targets
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calculator, Wallet, History, MoreHorizontal, X, Map, Globe, Award, Trophy } from 'lucide-react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

const TABS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/history', label: 'History', icon: History },
];

const MORE_LINKS = [
  { to: '/planner', label: 'Route Planner', icon: Map },
  { to: '/simulator', label: 'Simulator', icon: Globe },
  { to: '/passport', label: 'Passport', icon: Award },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function MobileTabBar() {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const isMoreActive = MORE_LINKS.some((l) => location.pathname === l.to);

  return (
    <LazyMotion features={domAnimation}>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-[#022c22]/95 backdrop-blur-md rounded-none border-t border-verdi-border">
        <div className="flex items-center justify-around h-16 px-2">
          {TABS.map((tab) => {
            const isActive = location.pathname === tab.to;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-3 py-1
                           transition-colors duration-200 rounded-lg
                           ${isActive ? 'text-verdi-accent' : 'text-verdi-muted hover:text-verdi-secondary'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-display font-semibold mt-0.5">{tab.label}</span>
                {isActive && (
                  <div className="w-4 h-0.5 bg-verdi-accent rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-3 py-1
                       transition-colors duration-200 rounded-lg
                       ${isMoreActive || showMore ? 'text-cyan-500' : 'text-verdi-muted hover:text-verdi-secondary'}`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-display font-semibold mt-0.5">More</span>
            {isMoreActive && (
              <div className="w-4 h-0.5 bg-cyan-500 rounded-full mt-0.5" />
            )}
          </button>
        </div>

        {/* More sheet */}
        <AnimatePresence>
          {showMore && (
            <>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[-1]"
                onClick={() => setShowMore(false)}
              />
              <m.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute bottom-full left-0 right-0 glass-card-strong rounded-b-none rounded-t-2xl p-4 pb-2 mb-0"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-xs font-display font-bold text-verdi-muted uppercase tracking-widest">
                    More
                  </p>
                  <button
                    onClick={() => setShowMore(false)}
                    className="w-8 h-8 rounded-lg glass-button flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-verdi-primary" />
                  </button>
                </div>
                {MORE_LINKS.map((link) => {
                  const isActive = location.pathname === link.to;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display font-semibold text-sm mb-1 transition-all
                        ${isActive
                          ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                          : 'text-verdi-secondary hover:text-verdi-primary hover:bg-verdi-subtle'
                        }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      {link.label}
                    </Link>
                  );
                })}
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
