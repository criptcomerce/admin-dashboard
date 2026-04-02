'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import { Table } from '@/components/ui/Table';
import { StatusBadge, CurrencyBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatUSD, timeAgo } from '@/lib/helpers';
import { Search, Filter, Download } from 'lucide-react';
import type { Order, OrderStatus, OrderCurrency } from '@/types';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

export default function OrdersPage() {
  const router = useRouter();
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState<OrderStatus | ''>('');
  const [currency, setCurrency] = useState<OrderCurrency | ''>('');
  const [page,     setPage]     = useState(1);

  const { data, isLoading } = useOrders();
  const allOrders: Order[] = data?.data ?? [];

  const filtered = useMemo(() => {
    return allOrders.filter((o) => {
      if (status   && o.status   !== status)   return false;
      if (currency && o.currency !== currency) return false;
      if (search   && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allOrders, status, currency, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const header = 'ID,Valor USD,Moeda,Status,Criado em';
    const rows   = filtered.map((o) => `${o.id},${o.amount_usd},${o.currency},${o.status},${o.created_at}`);
    const blob   = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} pedidos exportados`);
  };

  const columns = [
    {
      key: 'id', header: 'Order ID',
      render: (o: Order) => (
        <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{o.id.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'amount', header: 'Valor (USD)',
      render: (o: Order) => <span className="font-medium">{formatUSD(o.amount_usd)}</span>,
    },
    {
      key: 'currency', header: 'Moeda',
      render: (o: Order) => <CurrencyBadge currency={o.currency} />,
    },
    {
      key: 'status', header: 'Status',
      render: (o: Order) => <StatusBadge status={o.status} />,
    },
    {
      key: 'created', header: 'Criado',
      render: (o: Order) => (
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{timeAgo(o.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por ID…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={13} className="text-[hsl(var(--muted-foreground))]" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(1); }}
            className="text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="EXPIRED">Expirado</option>
          </select>
        </div>

        {/* Filtro por moeda */}
        <select
          value={currency}
          onChange={(e) => { setCurrency(e.target.value as OrderCurrency | ''); setPage(1); }}
          className="text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="">Todas as moedas</option>
          <option value="BTC">BTC</option>
          <option value="USDT">USDT</option>
          <option value="ETH">ETH</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{filtered.length} pedidos</span>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted-foreground))] transition-all"
          >
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : (
        <>
          <Table
            columns={columns}
            data={paginated}
            keyExtractor={(o) => o.id}
            onRowClick={(o) => router.push(`/orders/${o.id}`)}
            emptyMessage="Nenhum pedido encontrado com esses filtros"
          />
          <Pagination page={page} total={filtered.length} limit={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </div>
  );
}
