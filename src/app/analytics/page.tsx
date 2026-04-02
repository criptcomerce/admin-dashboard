'use client';
import { useDashboardMetrics } from '@/hooks/usePayments';
import { useOrders } from '@/hooks/useOrders';
import { Card } from '@/components/ui/Card';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OrdersChart } from '@/components/charts/OrdersChart';
import { CurrencyPieChart } from '@/components/charts/CurrencyPieChart';
import { PageLoader } from '@/components/ui/Loader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PAID: '#22c55e', PENDING: '#eab308', EXPIRED: '#ef4444',
};

function ConversionCard({ paid, total }: { paid: number; total: number }) {
  const rate = total > 0 ? ((paid / total) * 100) : 0;
  return (
    <Card>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Taxa de Conversão</p>
      <p className="text-3xl font-semibold text-[hsl(var(--foreground))]">{rate.toFixed(1)}%</p>
      <div className="mt-3 h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${rate}%` }} />
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{paid} pagos de {total} total</p>
    </Card>
  );
}

function AvgOrderCard({ orders }: { orders: Order[] }) {
  const paid = orders.filter((o) => o.status === 'PAID');
  const avg = paid.length > 0
    ? paid.reduce((s, o) => s + Number(o.amount_usd), 0) / paid.length
    : 0;
  return (
    <Card>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Ticket Médio (pedidos pagos)</p>
      <p className="text-3xl font-semibold text-[hsl(var(--foreground))]">
        ${avg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Baseado em {paid.length} pedidos</p>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const { data: ordersData }         = useOrders();
  const orders: Order[]              = ordersData?.data ?? [];

  if (isLoading) return <PageLoader />;
  if (!metrics) return null;

  const statusDist = [
    { name: 'Pagos',     value: metrics.paidOrders,    key: 'PAID' },
    { name: 'Pendentes', value: metrics.pendingOrders, key: 'PENDING' },
    { name: 'Expirados', value: metrics.expiredOrders, key: 'EXPIRED' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConversionCard paid={metrics.paidOrders} total={metrics.totalOrders} />
        <AvgOrderCard orders={orders} />
      </div>

      {/* Revenue + Orders side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Receita diária</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Últimos 14 dias (USD)</p>
          <RevenueChart data={metrics.revenueByDay} />
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Pedidos por dia</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Todos os status</p>
          <OrdersChart data={metrics.ordersByDay} />
        </Card>
      </div>

      {/* Distribuição de status + Moedas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Distribuição de Status</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Total de pedidos por status</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusDist} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 40% 9%)', border: '1px solid hsl(222 30% 16%)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [v, 'Pedidos']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {statusDist.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Receita por Moeda</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Apenas pedidos pagos</p>
          <CurrencyPieChart data={metrics.revenueByCurrency} />
        </Card>
      </div>
    </div>
  );
}
