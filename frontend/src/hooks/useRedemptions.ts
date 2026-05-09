import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Redemption, ApiResponse } from '@/types';

export function useActiveRedemptions() {
  return useQuery({
    queryKey: ['redemptions', 'active'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Redemption[]>>('/api/redemptions/active');
      return data.data;
    },
  });
}

export function useRedemptionHistory(status?: 'active' | 'expired') {
  return useInfiniteQuery({
    queryKey: ['redemptions', 'history', status || 'all'],
    queryFn: async ({ pageParam = 1 }) => {
      const statusParam = status ? `&status=${status}` : '';
      const { data } = await api.get<
        ApiResponse<{
          redemptions: Redemption[];
          page: number;
          totalPages: number;
        }>
      >(`/api/redemptions?page=${pageParam}&limit=10${statusParam}`);
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}
