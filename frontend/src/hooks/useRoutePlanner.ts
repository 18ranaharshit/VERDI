// Performance: TanStack Query hooks for route planner - mutations invalidate saved routes cache
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { PlanResult, SavedRoute, AutocompleteSuggestion, ApiResponse } from '@/types';

export function usePlanRoute() {
  return useMutation({
    mutationFn: async (input: { originText: string; destText: string }) => {
      const res = await api.post<ApiResponse<PlanResult>>('/api/routes/plan', input);
      return res.data.data;
    },
  });
}

export function useAutocomplete(q: string) {
  return useQuery<AutocompleteSuggestion[]>({
    queryKey: ['autocomplete', q],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AutocompleteSuggestion[]>>(
        `/api/routes/autocomplete?q=${encodeURIComponent(q)}`
      );
      return res.data.data;
    },
    enabled: q.length >= 3,
    staleTime: 30 * 1000,
  });
}

export function useSavedRoutes() {
  return useQuery<SavedRoute[]>({
    queryKey: ['savedRoutes'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SavedRoute[]>>('/api/routes/saved');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      originText: string;
      destText: string;
      originCoords: { lat: number; lng: number };
      destCoords: { lat: number; lng: number };
    }) => {
      const res = await api.post('/api/routes/saved', input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRoutes'] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/routes/saved/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRoutes'] });
    },
  });
}
