// Performance: TanStack Query hooks for trip data - staleTime tuned per data freshness needs
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { TripStats, PaginatedTrips, Trip, TripInput, Badge, LeaderboardEntry, ApiResponse } from '@/types';

export function useTripStats() {
  return useQuery<TripStats>({
    queryKey: ['trips', 'stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TripStats>>('/api/trips/stats');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrips(page: number = 1, limit: number = 10, mode?: string, sort?: string) {
  return useQuery<PaginatedTrips>({
    queryKey: ['trips', 'list', page, limit, mode, sort],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (mode) params.set('mode', mode);
      if (sort) params.set('sort', sort);
      const res = await api.get<ApiResponse<PaginatedTrips>>(`/api/trips?${params.toString()}`);
      return res.data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useInfiniteTrips(limit: number = 10, mode?: string, sort?: string) {
  return useInfiniteQuery<PaginatedTrips>({
    queryKey: ['trips', 'infinite', limit, mode, sort],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: String(limit) });
      if (mode) params.set('mode', mode);
      if (sort) params.set('sort', sort);
      const res = await api.get<ApiResponse<PaginatedTrips>>(`/api/trips?${params.toString()}`);
      return res.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TripInput) => {
      const res = await api.post('/api/trips', input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const res = await api.delete(`/api/trips/${tripId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useBadges() {
  return useQuery<Badge[]>({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Badge[]>>('/api/users/me/badges');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaderboard(institution?: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', institution],
    queryFn: async () => {
      const params = institution ? `?institution=${encodeURIComponent(institution)}` : '';
      const res = await api.get<ApiResponse<LeaderboardEntry[]>>(`/api/leaderboard${params}`);
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (institution: string) => {
      const res = await api.patch('/api/users/me', { institution });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}
