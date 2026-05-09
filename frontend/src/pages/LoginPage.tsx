// Performance: UI-only component - no server state, animated gradient mesh background + Google OAuth redirect
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: 4 + Math.random() * 4,
  x: Math.random() * 100,
  delay: Math.random() * 5,
  duration: 8 + Math.random() * 8,
  opacity: 0.2 + Math.random() * 0.5,
}));

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    window.location.href = `${baseUrl}/api/auth/google`;
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex items-center justify-center overflow-hidden px-4"
        style={{ minHeight: '100dvh', height: '100vh' }}>
        {/* Animated gradient mesh background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.08) 0%, transparent 50%),
              var(--bg-primary)
            `,
            backgroundSize: '200% 200%',
            animation: 'gradient-mesh 8s ease-in-out infinite',
          }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-verdi-accent"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              bottom: '-10px',
              opacity: p.opacity,
              animation: `particle-rise ${p.duration}s ${p.delay}s infinite linear`,
            }}
          />
        ))}

        {/* Login card */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass-card-strong w-full max-w-[440px] p-8 sm:p-10 relative z-10"
        >
          {/* Logo */}
          <m.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-verdi-accent/20 flex items-center justify-center animate-pulse-glow">
              <Leaf className="w-9 h-9 text-verdi-accent" />
            </div>
          </m.div>

          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="font-display text-4xl font-extrabold text-verdi-primary tracking-tight">
              {'Verdi'.split('').map((char, i) => (
                <m.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="inline-block"
                >
                  {char === '-' ? '\u2011' : char}
                </m.span>
              ))}
            </h1>
          </div>

          {/* Tagline */}
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-verdi-muted text-[0.95rem] mb-8"
          >
            Every commute is a choice. Make it count.
          </m.p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-verdi-border" />
            <span className="text-xs text-verdi-muted font-display uppercase tracking-wider">continue with</span>
            <div className="flex-1 h-px bg-verdi-border" />
          </div>

          {/* Google Button */}
          <m.button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="glass-button w-full h-12 rounded-xl flex items-center justify-center gap-3
                       font-display font-semibold text-verdi-primary
                       hover:shadow-glow transition-shadow duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-verdi-accent border-t-transparent animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>Continue with Google</span>
          </m.button>

          {/* Footer text */}
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-verdi-muted text-xs mt-6"
          >
            By continuing, you agree to reduce your carbon footprint 🌿
          </m.p>
        </m.div>
      </div>
    </LazyMotion>
  );
}
