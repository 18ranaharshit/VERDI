// Performance: UI-only component - Framer Motion spring animation for icon swap
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <LazyMotion features={domAnimation}>
      <button
        onClick={toggleTheme}
        className="glass-button w-10 h-10 rounded-xl flex items-center justify-center
                   hover:scale-[1.05] active:scale-[0.95] transition-transform duration-150"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <m.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {isDark ? (
            <Moon className="w-5 h-5 text-verdi-accent" />
          ) : (
            <Sun className="w-5 h-5 text-verdi-accent" />
          )}
        </m.div>
      </button>
    </LazyMotion>
  );
}
