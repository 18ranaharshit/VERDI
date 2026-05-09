// Performance: Render-optimized presentation component with isolated state for modal
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, X } from 'lucide-react';
import { useRedeem } from '@/hooks/useRewards';
import { useBalance } from '@/hooks/useCredits';
import { Reward } from '@/types';
import CreditChip from '../credits/CreditChip';

interface RewardCardProps {
  reward: Reward;
}

export default function RewardCard({ reward }: RewardCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { mutate: redeemReward, isPending } = useRedeem();
  const { data: balanceData } = useBalance();
  
  const balance = balanceData?.balance || 0;
  const canAfford = balance >= reward.creditCost;
  const { isBikeUnlock } = reward;

  const handleRedeem = () => {
    redeemReward(reward._id, {
      onSuccess: () => setShowModal(false),
    });
  };

  return (
    <>
      <m.button
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className={`w-full text-left p-5 transition-all h-full flex flex-col justify-between ${
          isBikeUnlock 
            ? 'glass-card-bike hover:shadow-lg hover:shadow-[#06B6D4]/20' 
            : 'glass-card hover:bg-glass-bg'
        }`}
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-4xl" role="img" aria-label="reward icon">{reward.icon}</span>
            <CreditChip 
              amount={reward.creditCost} 
              className={!canAfford ? 'opacity-50' : ''} 
            />
          </div>
          
          <h3 className={`font-display font-semibold text-lg mb-2 ${isBikeUnlock ? 'text-verdi-primary' : 'text-verdi-primary'}`}>
            {reward.title}
          </h3>
          <p className="text-verdi-muted text-sm line-clamp-2">
            {reward.description}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-glass-border flex items-center gap-2 text-xs text-verdi-muted font-medium">
          <Clock size={14} />
          <span>Valid for {reward.validityHours}h</span>
        </div>
      </m.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <m.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-sm rounded-2xl p-6 relative shadow-2xl ${
                isBikeUnlock ? 'glass-card-bike bg-white dark:bg-gray-900' : 'bg-white dark:bg-gray-900'
              }`}
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-verdi-input transition-colors"
                disabled={isPending}
              >
                <X size={20} className="text-verdi-muted" />
              </button>

              <div className="text-center mb-6 pt-4">
                <span className="text-6xl inline-block mb-4" role="img" aria-label="reward icon">
                  {reward.icon}
                </span>
                <h2 className="font-display font-bold text-2xl text-verdi-primary mb-2">{reward.title}</h2>
                <p className="text-verdi-muted">{reward.description}</p>
              </div>

              <div className="bg-verdi-input rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-verdi-muted font-medium">Current Balance</span>
                  <span className="font-mono font-bold text-verdi-primary">{balance} points</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-verdi-muted font-medium">Cost</span>
                  <span className="font-mono font-bold text-error">-{reward.creditCost} points</span>
                </div>
                <div className="h-px bg-verdi-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-verdi-primary">Remaining</span>
                  <span className={`font-mono font-bold ${canAfford ? 'text-success' : 'text-error'}`}>
                    {balance - reward.creditCost} points
                  </span>
                </div>
              </div>

              {!canAfford && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 text-warning mb-6">
                  <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    You need {reward.creditCost - balance} more credits to unlock this reward.
                  </p>
                </div>
              )}

              <button
                onClick={handleRedeem}
                disabled={!canAfford || isPending}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all relative overflow-hidden ${
                  !canAfford 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                    : isBikeUnlock
                      ? 'bg-gradient-to-r from-[#06B6D4] to-[#10B981] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      : 'bg-credit text-white shadow-lg shadow-credit/25 hover:bg-credit-hover hover:scale-[1.02]'
                }`}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Redeem for {reward.creditCost} points</span>
                )}
              </button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
