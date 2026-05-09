// Performance: Cached data from TanStack Query via useBalance. Rendered in Navbar.
import { Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBalance } from '@/hooks/useCredits';
import { useCountUp } from '@/hooks/useCountUp';

export default function CreditBalance() {
  const navigate = useNavigate();
  const { data: balanceData } = useBalance();
  const balance = balanceData?.balance || 0;

  // Animate the balance number when it changes
  const animatedBalance = useCountUp(balance, 1000);

  return (
    <button
      onClick={() => navigate('/wallet')}
      className="glass-card-gold flex items-center gap-2 px-3 min-h-[44px] hover:shadow-md transition-all duration-200 group"
      aria-label="View Wallet"
    >
      <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Coins size={16} className="text-amber-600 dark:text-amber-400" />
      </div>
      <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm whitespace-nowrap pr-1">
        {animatedBalance} pts
      </span>
    </button>
  );
}
