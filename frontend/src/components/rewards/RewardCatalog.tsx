import { m } from 'framer-motion';
import { useRewards } from '@/hooks/useRewards';
import RewardCard from './RewardCard';
import { Leaf } from 'lucide-react';

interface RewardCatalogProps {
  category?: string;
}

export default function RewardCatalog({ category }: RewardCatalogProps) {
  const { data: rewards, isLoading, error } = useRewards(category);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 h-48 skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (error || !rewards) {
    return (
      <div className="text-center py-12 text-error">
        Failed to load rewards catalog. Please try again.
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col items-center glass-card">
        <Leaf className="text-verdi-muted mb-4 opacity-50" size={48} />
        <h3 className="text-xl font-bold text-verdi-primary mb-2">No rewards found</h3>
        <p className="text-verdi-muted">Check back later for new offers in this category.</p>
      </div>
    );
  }

  return (
    <m.div
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {rewards.map((reward) => (
        <RewardCard key={reward._id} reward={reward} />
      ))}
    </m.div>
  );
}
