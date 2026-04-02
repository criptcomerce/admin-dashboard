'use client';
import { useRouter } from 'next/navigation';
import { useDashboardMetrics } from '@/hooks/usePayments';
import { MetricCard, Card } from '@/components/ui/Card';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OrdersChart } from '@/components/charts/OrdersChart';
import { CurrencyPieChart } from '@/components/charts/CurrencyPieChart';
import { StatusBadge, CurrencyBadge } from '@/components/ui/Badge';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { formatUSD, timeAgo } from '@/lib/helpers';
import {
  DollarSign, ShoppingCart, CheckCircle2, Clock,
  XCircle, Bitcoin, Coins, TrendingUp,
} from 'lucide-react';
import type { Order } from '@/types';

export default function DashboardPage() {
  const { data: metrics, isLoading, isError } = useDashboardMetrics();
  const router = useRouter();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <XCircle size={32} className="text-red-400" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Não foi possível conectar ao backend.<br />
          Verifique se o servidor está rodando em{' '}
          <code className="text-xs bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">
            {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
          </code>
        </p>
      </div>
    );
  }

  const paidPct = metrics
    ? metrics.totalOrders > 0
      ? ((metrics.paidOrders / metrics.totalOrders) * 100).toFixed(1)
      : '0'
    : '—';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Atualização automática a cada <span className="text-[hsl(var(--foreground))]">10 segundos</span>
        </p>
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Ao vivo
        </div>
      </div>

      {/* Metric cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          <MetricCard title="Receita Total"     value={formatUSD(metrics!.totalRevenue)}  icon={<DollarSign size={16} />}    accent="text-blue-400"   />
          <MetricCard title="Total de Pedidos"  value={metrics!.totalOrders}              icon={<ShoppingCart size={16} />}  accent="text-purple-400" />
          <MetricCard title="Pagos"             value={metrics!.paidOrders}               icon={<CheckCircle2 size={16} />}  accent="text-green-400"  trend={{ value: `${paidPct}% do total`, positive: true }} />
          <MetricCard title="Pendentes"         value={metrics!.pendingOrders}            icon={<Clock size={16} />}         accent="text-yellow-400" />
          <MetricCard title="Expirados"         value={metrics!.expiredOrders}            icon={<XCircle size={16} />}       accent="text-red-400"    />
        </div>
      )}

      {/* Revenue per currency cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <MetricCard title="Receita BTC"  value={formatUSD(metrics!.revenuePerCurrency.BTC)}  icon={<Bitcoin size={16} />}    accent="text-orange-400" />
          <MetricCard title="Receita USDT" value={formatUSD(metrics!.revenuePerCurrency.USDT)} icon={<Coins size={16} />}      accent="text-teal-400"   />
          <MetricCard title="Receita ETH"  value={formatUSD(metrics!.revenuePerCurrency.ETH)}  icon={<TrendingUp size={16} />} accent="text-indigo-400" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <h3 className="text-sm font-medium mb-1">Receita — últimos 14 dias</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Em dólares (USD)</p>
          {isLoading ? <ChartSkeleton /> : <RevenueChart data={metrics!.revenueByDay} />}
        </Card>
        <Card>
          <h3 className="text-sm font-medium mb-1">Receita por Moeda</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">BTC · USDT · ETH</p>
          {isLoading ? <ChartSkeleton /> : <CurrencyPieChart data={metrics!.revenueByCurrency} />}
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-medium mb-1">Pedidos por dia</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Todos os status — últimos 14 dias</p>
        {isLoading ? <ChartSkeleton /> : <OrdersChart data={metrics!.ordersByDay} />}
      </Card>

      {/* Latest Orders table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Últimos Pedidos</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">10 pedidos mais recentes</p>
          </div>
          <button
            onClick={() => router.push('/orders')}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver todos →
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Order ID', 'Valor (USD)', 'Moeda', 'Status', 'Criado'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {(metrics!.latestOrders as Order[]).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
                      Nenhum pedido ainda
                    </td>
                  </tr>
                ) : (
                  (metrics!.latestOrders as Order[]).map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="cursor-pointer hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      <td className="px-3 py-2.5 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                        {order.id.slice(0, 8)}…
                      </td>
                      <td className="px-3 py-2.5 font-medium">{formatUSD(order.amount_usd)}</td>
                      <td className="px-3 py-2.5"><CurrencyBadge currency={order.currency} /></td>
                      <td className="px-3 py-2.5"><StatusBadge status={order.status} /></td>
                      <td className="px-3 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">
                        {timeAgo(order.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
