// Performance: Heavy endpoint - staleTime 5min, refetchOnWindowFocus disabled
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { PassportData, ApiResponse } from '@/types';

export function usePassport() {
  return useQuery<PassportData>({
    queryKey: ['passport'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PassportData>>('/api/passport');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
