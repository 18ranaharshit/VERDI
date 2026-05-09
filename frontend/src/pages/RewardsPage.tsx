import { useState } from 'react';
import { m } from 'framer-motion';
import { Coins, Filter } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import RewardCatalog from '@/components/rewards/RewardCatalog';

const CATEGORIES = ['All', 'Transport', 'Food', 'Study', 'Store'];

export default function RewardsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-verdi-primary flex items-center gap-2">
              <Coins className="text-credit" /> Rewards Catalog
            </h1>
            <p className="text-verdi-muted mt-1">
              Redeem your hard-earned carbon credits for exclusive campus perks.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
            <Filter size={16} className="text-verdi-muted mr-1 flex-shrink-0" />
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-credit text-white shadow-md'
                    : 'bg-verdi-card text-verdi-muted hover:text-verdi-primary hover:bg-verdi-input'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        <m.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RewardCatalog category={activeCategory} />
        </m.div>
      </div>
    </PageWrapper>
  );
}
