// Performance: UI component with expandable QR code section
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Redemption } from '@/types';
import QRCodeDisplay from './QRCodeDisplay';
import CountdownTimer from './CountdownTimer';

interface VoucherCardProps {
  redemption: Redemption;
}

export default function VoucherCard({ redemption }: VoucherCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = redemption.status === 'active' && new Date(redemption.expiresAt) > new Date();
  const { title, icon, isBikeUnlock, howToUse } = redemption.rewardSnapshot;

  const baseClass = isActive
    ? isBikeUnlock
      ? 'glass-card-bike text-verdi-primary'
      : 'voucher-card text-verdi-primary'
    : 'glass-card opacity-60 grayscale text-verdi-muted';

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(redemption.voucherCode);
      } else {
        // Fallback for older iOS Safari
        const input = document.createElement('input');
        input.value = redemption.voucherCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className={baseClass}>
      <div className="p-5 relative z-10">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="reward icon">
              {icon}
            </span>
            <h3 className="font-display font-semibold text-lg leading-tight">{title}</h3>
          </div>
          <div
            className={`px-2 py-0.5 rounded-full text-xs font-bold tracking-wider ${
              isActive ? 'bg-verdi-accent/15 text-verdi-accent' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'
            }`}
          >
            {isActive ? 'ACTIVE' : 'EXPIRED'}
          </div>
        </div>

        {/* Voucher Code */}
        <div className="flex flex-col items-center justify-center py-4 border-y border-dashed border-credit-border/50 my-2">
          <div
            onClick={handleCopy}
            className="flex items-center gap-2 cursor-pointer group hover:bg-verdi-input px-4 py-2 rounded-lg transition-colors"
          >
            <span className="font-mono font-bold text-xl tracking-[0.15em] text-center">
              {redemption.voucherCode}
            </span>
            {copied ? (
              <CheckCircle2 size={18} className="text-verdi-accent" />
            ) : (
              <Copy size={18} className="text-verdi-muted group-hover:text-verdi-primary transition-colors" />
            )}
          </div>
        </div>

        {/* Expiry Info */}
        <div className="flex items-center justify-between mt-4">
          {isActive ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-verdi-muted">Expires in:</span>
              <CountdownTimer expiresAt={redemption.expiresAt} />
            </div>
          ) : (
            <span className="text-sm">
              Expired {new Date(redemption.expiresAt).toLocaleDateString()}
            </span>
          )}

          {isActive && (
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-sm font-semibold text-info hover:text-info/80 transition-colors"
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable QR Code Section */}
      <AnimatePresence>
        {showQR && isActive && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white/5 dark:bg-black/20 relative z-10"
          >
            <div className="p-5 border-t border-verdi-border">
              <p className="text-sm text-center text-verdi-muted mb-2 max-w-sm mx-auto">{howToUse}</p>
              <QRCodeDisplay value={redemption.voucherCode} />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
