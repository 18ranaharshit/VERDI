import { useState } from 'react';
import { Ticket, History } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import VoucherCard from '@/components/vouchers/VoucherCard';
import { useActiveRedemptions, useRedemptionHistory } from '@/hooks/useRedemptions';

export default function VouchersPage() {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const { data: activeVouchers, isLoading: loadingActive } = useActiveRedemptions();
  const {
    data: historyData,
    isLoading: loadingHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRedemptionHistory();

  const renderActive = () => {
    if (loadingActive) return <div className="text-center py-8">Loading...</div>;
    
    if (!activeVouchers || activeVouchers.length === 0) {
      return (
        <div className="text-center py-16 flex flex-col items-center glass-card">
          <Ticket className="text-verdi-muted mb-4 opacity-50" size={48} />
          <h3 className="text-xl font-bold text-verdi-primary mb-2">No Active Vouchers</h3>
          <p className="text-verdi-muted">Head over to the Rewards catalog to redeem your credits.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeVouchers.map((voucher) => (
          <VoucherCard key={voucher._id} redemption={voucher} />
        ))}
      </div>
    );
  };

  const renderHistory = () => {
    if (loadingHistory) return <div className="text-center py-8">Loading...</div>;

    const historyVouchers = historyData?.pages.flatMap((page) => page.redemptions) || [];

    if (historyVouchers.length === 0) {
      return (
        <div className="text-center py-16 flex flex-col items-center glass-card">
          <History className="text-verdi-muted mb-4 opacity-50" size={48} />
          <h3 className="text-xl font-bold text-verdi-primary mb-2">No History</h3>
          <p className="text-verdi-muted">You haven't redeemed any rewards yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {historyVouchers.map((voucher) => (
            <VoucherCard key={voucher._id} redemption={voucher} />
          ))}
        </div>
        
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 glass-button rounded-xl font-semibold hover:bg-glass-bg transition-colors"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-display font-bold text-verdi-primary flex items-center gap-2">
            <Ticket className="text-credit" /> My Vouchers
          </h1>
          <p className="text-verdi-muted mt-1">Manage your active rewards and view your redemption history.</p>
        </header>

        <div className="flex bg-verdi-card p-1 rounded-xl w-full max-w-sm border border-verdi-border">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              tab === 'active' ? 'bg-verdi-input shadow-sm text-verdi-primary' : 'text-verdi-muted hover:text-verdi-primary hover:bg-verdi-input'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              tab === 'history' ? 'bg-verdi-input shadow-sm text-verdi-primary' : 'text-verdi-muted hover:text-verdi-primary hover:bg-verdi-input'
            }`}
          >
            History
          </button>
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'active' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'active' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'active' ? renderActive() : renderHistory()}
          </m.div>
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
