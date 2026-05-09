import { Wallet, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import TransactionFeed from '@/components/credits/TransactionFeed';
import { useBalance } from '@/hooks/useCredits';
import { useCountUp } from '@/hooks/useCountUp';

export default function WalletPage() {
  const { data: balanceData, isLoading } = useBalance();
  
  const balance = balanceData?.balance || 0;
  const totalEarned = balanceData?.totalEarned || 0;
  const totalSpent = balanceData?.totalSpent || 0;

  const animatedBalance = useCountUp(balance, 1500);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-verdi-primary flex items-center gap-2">
              <Wallet className="text-credit" /> My Wallet
            </h1>
            <p className="text-verdi-muted mt-1">Manage your carbon points and transaction history.</p>
          </div>
          <Link
            to="/rewards"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-credit text-white rounded-xl font-bold hover:bg-credit-hover transition-colors shadow-lg shadow-credit/20"
          >
            Redeem <ArrowRight size={18} />
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 glass-card-gold p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wallet size={120} />
            </div>
            <p className="text-credit font-bold uppercase tracking-widest mb-2 relative z-10">Available Balance</p>
            {isLoading ? (
              <div className="h-16 w-48 skeleton-shimmer rounded-xl relative z-10" />
            ) : (
              <>
                <h2 className="text-6xl sm:text-7xl font-mono font-bold text-verdi-primary tracking-tight relative z-10">
                  {animatedBalance} <span className="text-3xl text-credit">points</span>
                </h2>
                <div className="flex gap-4 mt-4 relative z-10 justify-center">
                  <div className="bg-white/20 dark:bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm border border-white/10 min-w-[100px]">
                    <p className="text-xs text-verdi-muted uppercase tracking-wider font-bold mb-1 text-left">Value</p>
                    <p className="font-mono font-bold text-xl text-verdi-primary text-left">₹{Math.floor(balance / 100)}</p>
                  </div>
                  <div className="bg-white/20 dark:bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm border border-white/10 min-w-[100px]">
                    <p className="text-xs text-verdi-muted uppercase tracking-wider font-bold mb-1 text-left">Vouchers</p>
                    <p className="font-mono font-bold text-xl text-verdi-primary text-left">{Math.floor(balance / 10000)}</p>
                  </div>
                </div>
                <p className="text-xs text-verdi-muted mt-4 relative z-10 max-w-md mx-auto bg-white/20 dark:bg-black/20 p-3 rounded-lg border border-white/10 text-left leading-relaxed">
                  <span className="font-bold text-credit mr-1">💡 How it works:</span>
                  100 points = ₹1, and ₹100 earns 1 voucher. Minimum 10,000 points is required to earn a reward. Vouchers are contributed to rewards by planting a tree!
                </p>
              </>
            )}
            
            <Link
              to="/rewards"
              className="sm:hidden mt-6 flex items-center gap-2 px-6 py-3 bg-credit text-white rounded-xl font-bold hover:bg-credit-hover transition-colors shadow-lg shadow-credit/20 relative z-10"
            >
              Redeem points <ArrowRight size={18} />
            </Link>
          </div>

          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-verdi-accent/15 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={24} className="text-verdi-accent" />
            </div>
            <div>
              <p className="text-sm text-verdi-muted font-medium mb-1">Total Earned</p>
              <p className="text-2xl font-mono font-bold text-verdi-primary">{totalEarned}</p>
            </div>
          </div>

          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-credit-subtle flex items-center justify-center flex-shrink-0">
              <TrendingDown size={24} className="text-credit" />
            </div>
            <div>
              <p className="text-sm text-verdi-muted font-medium mb-1">Total Spent</p>
              <p className="text-2xl font-mono font-bold text-verdi-primary">{totalSpent}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-display font-bold text-verdi-primary mb-4">Transaction History</h2>
          <TransactionFeed />
        </div>
      </div>
    </PageWrapper>
  );
}
