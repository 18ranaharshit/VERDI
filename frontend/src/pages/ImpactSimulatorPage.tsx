// Performance: Zero API calls - entirely client-side useMemo math with instant slider response
import { useState, useMemo } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import GlassCard from '@/components/ui/GlassCard';
import SliderControl from '@/components/simulator/SliderControl';
import ImpactCounter from '@/components/simulator/ImpactCounter';
import ImpactEquivalents from '@/components/simulator/ImpactEquivalents';
import SimulatorChart from '@/components/simulator/SimulatorChart';
import { calculateImpact } from '@/utils/simulator';
import type { SimulatorInputs } from '@/types';

const container = { animate: { transition: { staggerChildren: 0.05 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function ImpactSimulatorPage() {
  const [inputs, setInputs] = useState<SimulatorInputs>({
    students: 5000,
    distKm: 8,
    pctCycling: 20,
    pctWalking: 10,
    pctBus: 25,
    pctElectric: 10,
  });

  const totalPct = inputs.pctCycling + inputs.pctWalking + inputs.pctBus + inputs.pctElectric;
  const isOverLimit = totalPct > 100;

  const result = useMemo(() => calculateImpact(inputs), [inputs]);

  const setField = <K extends keyof SimulatorInputs>(key: K, value: SimulatorInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleShare = () => {
    const text = `🍃 Campus Impact Simulation:\n${inputs.students.toLocaleString()} commuters × ${inputs.distKm}km could save ${result.savedYearlyTons} tons of CO₂ per year - equivalent to planting ${result.treesEquivalent.toLocaleString()} trees!\n\n#Verdi #EcoCommuter`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <PageWrapper>
      <LazyMotion features={domAnimation}>
        <m.div variants={container} initial="initial" animate="animate" className="space-y-6">

          {/* Header */}
          <m.div variants={item}>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-verdi-primary tracking-tight">
              🎛️ Campus Impact Simulator
            </h1>
            <p className="text-verdi-muted text-sm mt-1 font-medium">
              Model what happens when your campus shifts to greener transport
            </p>
          </m.div>

          {/* Hero Impact Counter */}
          <m.div variants={item}>
            <GlassCard className="p-6 sm:p-8 text-center">
              <p className="text-xs font-display font-bold uppercase tracking-widest text-verdi-muted mb-4">
                Annual Carbon Savings
              </p>
              <ImpactCounter
                value={result.savedYearlyTons}
                unit="tons CO₂ / year"
                label="If your campus adopts this transport mix"
                color="var(--accent)"
              />
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="text-center px-4">
                  <p className="font-mono text-sm text-verdi-muted">Before</p>
                  <p className="font-mono font-bold text-lg text-red-500">{result.currentDailyKg} kg/day</p>
                </div>
                <div className="text-2xl">→</div>
                <div className="text-center px-4">
                  <p className="font-mono text-sm text-verdi-muted">After</p>
                  <p className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">{result.newDailyKg} kg/day</p>
                </div>
              </div>
            </GlassCard>
          </m.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Controls */}
            <m.div variants={item} className="space-y-4">
              {/* Campus size */}
              <SliderControl
                label="Number of Commuters"
                value={inputs.students}
                onChange={(v) => setField('students', v)}
                min={100}
                max={50000}
                step={100}
                unit=""
                color="var(--accent)"
                icon="👥"
              />
              <SliderControl
                label="Average Commute Distance"
                value={inputs.distKm}
                onChange={(v) => setField('distKm', v)}
                min={1}
                max={50}
                step={1}
                unit=" km"
                color="var(--info)"
                icon="📏"
              />

              <div className="h-px bg-verdi-border/50" />

              {/* Over limit warning */}
              {isOverLimit && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  ⚠️ Total exceeds 100% - remaining car share is negative ({Math.round(100 - totalPct)}%)
                </div>
              )}

              {/* Mode sliders */}
              <SliderControl
                label="Cycling"
                value={inputs.pctCycling}
                onChange={(v) => setField('pctCycling', v)}
                color="var(--route-cycling)"
                icon="🚴"
              />
              <SliderControl
                label="Walking"
                value={inputs.pctWalking}
                onChange={(v) => setField('pctWalking', v)}
                color="var(--route-walking)"
                icon="🚶"
              />
              <SliderControl
                label="Bus / Public Transit"
                value={inputs.pctBus}
                onChange={(v) => setField('pctBus', v)}
                color="var(--route-bus)"
                icon="🚌"
              />
              <SliderControl
                label="Electric Vehicle"
                value={inputs.pctElectric}
                onChange={(v) => setField('pctElectric', v)}
                color="var(--route-electric)"
                icon="⚡"
              />

              {/* Remaining car share */}
              <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚗</span>
                  <span className="font-display font-semibold text-sm text-verdi-primary">Car (remaining)</span>
                </div>
                <span className="font-mono font-bold text-lg" style={{ color: isOverLimit ? 'var(--danger)' : 'var(--route-car)' }}>
                  {Math.max(0, 100 - totalPct)}%
                </span>
              </div>
            </m.div>

            {/* Right: Results */}
            <m.div variants={item} className="space-y-4">
              <ImpactEquivalents result={result} />
              <SimulatorChart
                pctCycling={inputs.pctCycling}
                pctWalking={inputs.pctWalking}
                pctBus={inputs.pctBus}
                pctElectric={inputs.pctElectric}
              />
              {/* Share button */}
              <button
                onClick={handleShare}
                className="w-full py-3 rounded-xl glass-button font-display font-bold text-sm text-verdi-primary
                           hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                📤 Share Impact Results
              </button>
            </m.div>
          </div>
        </m.div>
      </LazyMotion>
    </PageWrapper>
  );
}
