import { useQuery } from '@tanstack/react-query';
import { fetchOrders, fetchOrderById, fetchPaymentByOrderId } from '@/lib/api';
import type { OrderFilters } from '@/types';

export function useOrders(filters: Partial<OrderFilters> = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetchOrders(filters as Record<string, unknown>),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
}

export function useOrderWithPayment(orderId: string) {
  const query = useQuery({
    queryKey: ['order-with-payment', orderId],
    queryFn:  () => fetchOrderById(orderId),
    enabled:  !!orderId,
  });

  return {
    order:     query.data?.order   ?? null,
    payment:   query.data?.payment ?? null,
    isLoading: query.isLoading,
    isError:   query.isError,
  };
}
