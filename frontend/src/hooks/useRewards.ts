import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Reward, Redemption, ApiResponse } from '@/types';
import { CREDIT_BALANCE_KEY } from './useCredits';

export function useRewards(category?: string) {
  return useQuery({
    queryKey: ['rewards', category || 'all'],
    queryFn: async () => {
      const params = category && category !== 'All' ? `?category=${category.toLowerCase()}` : '';
      const { data } = await api.get<ApiResponse<Reward[]>>(`/api/rewards${params}`);
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - catalog rarely changes
    refetchOnWindowFocus: false,
  });
}

export function useRedeem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId: string) => {
      const { data } = await api.post<
        ApiResponse<{ redemption: Redemption; reward: Reward; newBalance: number }>
      >('/api/redemptions', { rewardId });
      return data.data;
    },
    onSuccess: () => {
      // Invalidate balance and redemptions to show new state
      queryClient.invalidateQueries({ queryKey: CREDIT_BALANCE_KEY });
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['credits', 'transactions'] });
    },
  });
}
