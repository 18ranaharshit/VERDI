// Performance: html2canvas dynamically imported only on "Download Card" click
import { useRef, useState, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { PassportData } from '@/types';

interface PassportShareCardProps {
  data: PassportData;
  displayName: string;
}

export default function PassportShareCard({ data, displayName }: PassportShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `verdi-carbon-passport-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Share card download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const { summary, grade, streaks, projection } = data;
  const memberSince = new Date(summary.memberSinceDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div>
      {/* Exportable card - uses solid background for html2canvas compatibility */}
      <div ref={cardRef} className="passport-share-card">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-1">
              Carbon Passport
            </p>
            <h3 className="font-display font-extrabold text-2xl leading-tight">
              {displayName}
            </h3>
            <p className="text-xs opacity-50 mt-0.5">Member since {memberSince}</p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <span className="accent-text font-display font-extrabold text-2xl">{grade}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest mt-1 opacity-50">Grade</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="accent-text font-mono font-bold text-xl">
              {(summary.totalCarbonSaved / 1000).toFixed(1)}
            </p>
            <p className="text-[10px] opacity-50">kg CO₂ saved</p>
          </div>
          <div>
            <p className="amber-text font-mono font-bold text-xl">
              {summary.totalTrips}
            </p>
            <p className="text-[10px] opacity-50">eco commutes</p>
          </div>
          <div>
            <p className="font-mono font-bold text-xl" style={{ color: '#8B5CF6' }}>
              {streaks.longestStreak}
            </p>
            <p className="text-[10px] opacity-50">day best streak</p>
          </div>
        </div>

        {/* Projection bar */}
        <div className="p-3 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">
            Projected Annual Savings
          </p>
          <p className="accent-text font-mono font-bold text-lg">
            {(projection.projectedYearlySavings / 1000).toFixed(1)} kg CO₂
          </p>
        </div>

        {/* Branding */}
        <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <span className="accent-text font-bold text-sm">🍃 Verdi</span>
            <span className="text-[10px] opacity-30">Eco Commuter</span>
          </div>
          <span className="text-[10px] opacity-30 font-mono">
            {new Date().toISOString().split('T')[0]}
          </span>
        </div>
      </div>

      {/* Download button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm
                     bg-gradient-to-r from-emerald-600 to-emerald-500 text-white
                     shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30
                     disabled:opacity-50 transition-all"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isDownloading ? 'Generating...' : 'Download Card'}
        </button>
      </div>
    </div>
  );
}
