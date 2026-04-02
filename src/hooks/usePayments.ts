import { useQuery } from '@tanstack/react-query';
import { fetchPayments, fetchDashboardMetrics } from '@/lib/api';
import type { PaymentFilters } from '@/types';

export function usePayments(filters: Partial<PaymentFilters> = {}) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => fetchPayments(filters as Record<string, unknown>),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// Dashboard atualiza mais rápido — a cada 10s
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}
