// Performance: UI-only component - toast auto-dismiss with progress bar
import { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { ToastData } from '@/types';

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const BORDER_COLORS = {
  success: 'border-l-4 border-l-verdi-accent',
  error: 'border-l-4 border-l-[var(--danger)]',
  info: 'border-l-4 border-l-[var(--info)]',
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4000;
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`glass-card max-w-[360px] w-full overflow-hidden ${BORDER_COLORS[toast.type]}`}
      >
        <div className="p-4 flex items-start gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${toast.type === 'success' ? 'text-verdi-accent' :
              toast.type === 'error' ? 'text-[var(--danger)]' : 'text-[var(--info)]'
            }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-semibold text-verdi-primary">{toast.title}</p>
            {toast.message && (
              <p className="text-xs text-verdi-muted mt-0.5">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-verdi-muted hover:text-verdi-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-0.5 bg-verdi-card">
          <div
            className={`h-full transition-all duration-100 ease-linear ${toast.type === 'success' ? 'bg-verdi-accent' :
                toast.type === 'error' ? 'bg-[var(--danger)]' : 'bg-[var(--info)]'
              }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </m.div>
    </LazyMotion>
  );
}
