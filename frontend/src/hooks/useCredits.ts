import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { CreditBalance, CreditTransaction, ApiResponse } from '@/types';

export const CREDIT_BALANCE_KEY = ['credits', 'balance'];

export function useBalance() {
  return useQuery({
    queryKey: CREDIT_BALANCE_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CreditBalance>>('/api/credits/balance');
      return data.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useTransactions() {
  return useInfiniteQuery({
    queryKey: ['credits', 'transactions'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<
        ApiResponse<{
          transactions: CreditTransaction[];
          page: number;
          totalPages: number;
        }>
      >(`/api/credits/transactions?page=${pageParam}&limit=15`);
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
