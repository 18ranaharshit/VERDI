// Performance: Presentation component for TransactionFeed
import { m } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CreditTransaction } from '@/types';

interface TransactionRowProps {
  transaction: CreditTransaction;
}

export default function TransactionRow({ transaction }: TransactionRowProps) {
  const isCredit = transaction.type === 'credit';
  const Icon = isCredit ? ArrowUpRight : ArrowDownLeft;
  
  // Format date relative to today or absolute short date
  const dateObj = new Date(transaction.createdAt);
  const isToday = new Date().toDateString() === dateObj.toDateString();
  const dateStr = isToday 
    ? `Today, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      }}
      className="group flex items-center gap-3 py-3 border-b border-border last:border-0 hover:bg-glass-bg rounded-lg px-2 -mx-2 transition-colors cursor-default"
    >
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCredit ? 'bg-accent-subtle' : 'bg-credit-subtle'
        }`}
      >
        <Icon size={20} className={isCredit ? 'text-accent' : 'text-credit'} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary truncate">
          {transaction.reason}
        </p>
        <p className="text-xs text-muted truncate mt-0.5">
          {dateStr}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-mono text-sm font-bold ${isCredit ? 'text-accent' : 'text-credit'}`}>
          {isCredit ? '+' : '-'}{transaction.amount} pts
        </p>
        <p className="font-mono text-xs text-muted mt-0.5">
          Bal: {transaction.balance}
        </p>
      </div>
    </m.div>
  );
}
