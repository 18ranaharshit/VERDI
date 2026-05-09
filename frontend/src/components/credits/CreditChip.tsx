// Performance: UI-only presentation component
import { Coins } from 'lucide-react';

interface CreditChipProps {
  amount: number;
  className?: string;
  prefix?: string;
}

export default function CreditChip({ amount, className = '', prefix = '' }: CreditChipProps) {
  return (
    <div className={`inline-flex items-center gap-1 text-credit font-mono ${className}`}>
      <Coins size={14} className="text-credit flex-shrink-0" />
      <span className="font-bold">
        {prefix}
        {amount} pts
      </span>
    </div>
  );
}
