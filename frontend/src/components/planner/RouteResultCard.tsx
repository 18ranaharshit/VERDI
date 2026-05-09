// Performance: UI-only component - single mode result card with stats grid
import { useNavigate } from 'react-router-dom';
import { Bike, Bus, Car, Zap, Footprints, Navigation } from 'lucide-react';
import type { RouteResult, TransportMode } from '@/types';

const MODE_CONFIG: Record<string, {
  label: string; icon: React.ReactNode; color: string; colorVar: string;
}> = {
  cycling: { label: 'Cycling', icon: <Bike className="w-5 h-5" />, color: '#10B981', colorVar: 'var(--route-cycling)' },
  walking: { label: 'Walking', icon: <Footprints className="w-5 h-5" />, color: '#8B5CF6', colorVar: 'var(--route-walking)' },
  bus: { label: 'Bus', icon: <Bus className="w-5 h-5" />, color: '#EAB308', colorVar: 'var(--route-bus)' },
  electric_car: { label: 'Electric Car', icon: <Zap className="w-5 h-5" />, color: '#06B6D4', colorVar: 'var(--route-electric)' },
  motorcycle: { label: 'Motorcycle', icon: <Navigation className="w-5 h-5" />, color: '#F97316', colorVar: 'var(--route-moto)' },
  car: { label: 'Car', icon: <Car className="w-5 h-5" />, color: '#EF4444', colorVar: 'var(--route-car)' },
};

interface RouteResultCardProps {
  mode: string;
  result: RouteResult;
  isSelected: boolean;
  onClick: () => void;
  originText: string;
  destText: string;
}

export default function RouteResultCard({ mode, result, isSelected, onClick, originText, destText }: RouteResultCardProps) {
  const navigate = useNavigate();
  const config = MODE_CONFIG[mode] || MODE_CONFIG.car;
  const isCar = mode === 'car';
  const isGreenest = mode === 'cycling';
  const isSecond = mode === 'walking';

  const handlePlanTrip = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem('plannerRoute', JSON.stringify({
      origin: originText,
      dest: destText,
      distance: result.distanceKm,
      mode: mode as TransportMode,
    }));
    navigate('/calculator');
  };

  return (
    <div
      onClick={onClick}
      className={`glass-card p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected ? 'route-card-selected' : ''}
        ${isCar ? 'bg-red-500/[0.03] dark:bg-red-500/[0.06]' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Mode identity */}
        <div className="flex flex-col items-center gap-1 w-16 flex-shrink-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: config.color }}
          >
            {config.icon}
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-verdi-muted text-center">
            {config.label}
          </span>
          {isGreenest && (
            <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
              🏆 Greenest
            </span>
          )}
          {isSecond && (
            <span className="text-[9px] bg-violet-500/15 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full font-bold">
              🥈 Clean
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-verdi-muted">📏 Distance</p>
              <p className="font-mono font-bold text-sm text-verdi-primary">{result.distanceKm} km</p>
            </div>
            <div>
              <p className="text-xs text-verdi-muted">⏱ Duration</p>
              <p className="font-mono font-bold text-sm text-verdi-primary">{result.durationMin} min</p>
            </div>
            <div>
              <p className="text-xs text-verdi-muted">💨 CO₂ Emitted</p>
              <p className="font-mono font-bold text-sm" style={{ color: config.color }}>
                {result.carbonEmitted} g
              </p>
            </div>
            <div>
              <p className="text-xs text-verdi-muted">🌱 Saved vs Car</p>
              <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {isCar ? '-' : `+${result.carbonSaved} g`}
              </p>
            </div>
          </div>

          {/* Credits chip + action */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-verdi-border/30">
            {!isCar && result.creditsIfLogged > 0 ? (
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                +{result.creditsIfLogged} pts if logged
              </span>
            ) : isCar ? (
              <span className="text-[10px] text-red-500/70 font-medium">Baseline (most polluting)</span>
            ) : (
              <span />
            )}
            <button
              onClick={handlePlanTrip}
              className="text-xs font-display font-semibold px-3 py-1.5 rounded-lg border border-verdi-border
                         text-verdi-primary hover:bg-verdi-subtle transition-colors"
            >
              Plan This Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
