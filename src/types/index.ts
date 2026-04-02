// ─── Enums ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'PAID' | 'EXPIRED';
export type OrderCurrency = 'BTC' | 'USDT' | 'ETH';

// ─── Entidades ────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  amount_usd: number;
  currency: OrderCurrency;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  invoice_id: string;
  payment_address: string;
  payment_amount: number;
  expiration_time: string;
  tx_hash: string | null;
  paid_at: string | null;
  created_at: string;
  last_reconciled_at?: string | null;
  reconciliation_attempts?: number;
  order?: Order;
}

export interface Transfer {
  id: string;
  currency: string;
  amount: number;
  tx_hash: string | null;
  executed_at: string;
  created_at: string;
}

// ─── Responses da API ─────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// ─── Dashboard metrics ────────────────────────────────────────────────────────
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  expiredOrders: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByDay: { date: string; count: number }[];
  revenueByCurrency: { currency: string; amount: number }[];
  // Novo: receita detalhada por moeda
  revenuePerCurrency: {
    BTC: number;
    USDT: number;
    ETH: number;
  };
  // Novo: últimos 10 pedidos para tabela no dashboard
  latestOrders: Order[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  username: string;
  token: string;
}

// ─── Filtros ─────────────────────────────────────────────────────────────────
export interface OrderFilters {
  status?: OrderStatus | '';
  currency?: OrderCurrency | '';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

export interface PaymentFilters {
  page: number;
  limit: number;
  search?: string;
}
