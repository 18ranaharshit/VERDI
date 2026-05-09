// Performance: UI-only component - zero server interaction
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'strong';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function GlassCard({ children, variant = 'default', className = '', style, onClick }: GlassCardProps) {
  const baseClass = variant === 'strong' ? 'glass-card-strong' : 'glass-card';

  return (
    <div
      className={`${baseClass} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
