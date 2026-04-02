import axios from 'axios';
import Cookies from 'js-cookie';
import { format, subDays } from 'date-fns';
import type { Order, Payment, DashboardMetrics } from '@/types';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

function normalize<T>(raw: T[] | { data: T[]; total: number }): { data: T[]; total: number } {
  if (Array.isArray(raw)) return { data: raw, total: raw.length };
  return raw;
}

export async function fetchOrders(params?: Record<string, unknown>) {
  const { data } = await api.get('/orders', { params });
  return normalize<Order>(data);
}

export async function fetchOrderById(
  id: string,
): Promise<{ order: Order; payment: Payment | null }> {
  const { data } = await api.get(`/orders/${id}`);
  // Compatibilidade: backend novo retorna { order, payment }, antigo retorna só a Order
  if (data?.order) return data;
  return { order: data as Order, payment: null };
}

export async function fetchPayments(params?: Record<string, unknown>) {
  const { data } = await api.get('/payments', { params });
  return normalize<Payment>(data);
}

export async function fetchPaymentByOrderId(orderId: string): Promise<Payment | null> {
  try {
    const { data } = await api.get('/payments');
    const payments: Payment[] = Array.isArray(data) ? data : data?.data ?? [];
    return payments.find((p) => p.order_id === orderId || p.order?.id === orderId) ?? null;
  } catch {
    return null;
  }
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const [ordersRaw, paymentsRaw] = await Promise.all([
    api.get('/orders'),
    api.get('/payments'),
  ]);
  const orders: Order[]   = Array.isArray(ordersRaw.data)   ? ordersRaw.data   : ordersRaw.data?.data   ?? [];
  const payments: Payment[] = Array.isArray(paymentsRaw.data) ? paymentsRaw.data : paymentsRaw.data?.data ?? [];
  return computeMetrics(orders, payments);
}

function computeMetrics(orders: Order[], _payments: Payment[]): DashboardMetrics {
  const paid    = orders.filter((o) => o.status === 'PAID');
  const pending = orders.filter((o) => o.status === 'PENDING');
  const expired = orders.filter((o) => o.status === 'EXPIRED');
  const totalRevenue = paid.reduce((s, o) => s + Number(o.amount_usd), 0);

  const revenueByDay = Array.from({ length: 14 }, (_, i) => {
    const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
    const rev  = paid.filter((o) => o.created_at?.startsWith(date)).reduce((s, o) => s + Number(o.amount_usd), 0);
    return { date: format(subDays(new Date(), 13 - i), 'dd/MM'), revenue: rev };
  });

  const ordersByDay = Array.from({ length: 14 }, (_, i) => {
    const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
    return { date: format(subDays(new Date(), 13 - i), 'dd/MM'), count: orders.filter((o) => o.created_at?.startsWith(date)).length };
  });

  const revenueByCurrency = (['BTC', 'USDT', 'ETH'] as const).map((currency) => ({
    currency,
    amount: paid.filter((o) => o.currency === currency).reduce((s, o) => s + Number(o.amount_usd), 0),
  }));

  // Receita detalhada por moeda
  const revenuePerCurrency = {
    BTC:  paid.filter((o) => o.currency === 'BTC').reduce((s, o)  => s + Number(o.amount_usd), 0),
    USDT: paid.filter((o) => o.currency === 'USDT').reduce((s, o) => s + Number(o.amount_usd), 0),
    ETH:  paid.filter((o) => o.currency === 'ETH').reduce((s, o)  => s + Number(o.amount_usd), 0),
  };

  // Últimos 10 pedidos ordenados por created_at DESC
  const latestOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return {
    totalRevenue,
    totalOrders: orders.length,
    paidOrders:    paid.length,
    pendingOrders: pending.length,
    expiredOrders: expired.length,
    revenueByDay,
    ordersByDay,
    revenueByCurrency,
    revenuePerCurrency,
    latestOrders,
  };
}
