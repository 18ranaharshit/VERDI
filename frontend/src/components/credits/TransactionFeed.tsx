// Performance: Infinite scrolling via IntersectionObserver to load pages efficiently
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { m } from 'framer-motion';
import { Coins, Leaf } from 'lucide-react';
import { useTransactions } from '@/hooks/useCredits';
import TransactionRow from './TransactionRow';

export default function TransactionFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useTransactions();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === 'pending') {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-full skeleton-shimmer flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-48 rounded skeleton-shimmer mb-2" />
              <div className="h-3 w-32 rounded skeleton-shimmer" />
            </div>
            <div className="text-right">
              <div className="h-4 w-16 rounded skeleton-shimmer mb-1" />
              <div className="h-3 w-24 rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return <div className="text-center text-error py-8">Failed to load transactions.</div>;
  }

  const transactions = data?.pages.flatMap((page) => page.transactions) || [];

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4">
          <Coins className="absolute bottom-0 right-0 text-credit" size={40} />
          <Leaf className="absolute top-0 left-0 text-accent" size={32} />
        </div>
        <h3 className="text-lg font-bold text-primary mb-1">No transactions yet</h3>
        <p className="text-muted text-sm max-w-[250px]">
          Log a green commute to earn your first carbon credits!
        </p>
      </div>
    );
  }

  return (
    <m.div
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      initial="hidden"
      animate="visible"
    >
      {transactions.map((tx) => (
        <TransactionRow key={tx._id} transaction={tx} />
      ))}
      
      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-8 flex items-center justify-center mt-4">
        {isFetchingNextPage && (
          <div className="w-6 h-6 border-2 border-credit border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </m.div>
  );
}
