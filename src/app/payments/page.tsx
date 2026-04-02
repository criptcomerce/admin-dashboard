'use client';
import { useState, useMemo } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { Table } from '@/components/ui/Table';
import { CopyButton } from '@/components/ui/CopyButton';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatDate, truncateAddress, getExplorerUrl } from '@/lib/helpers';
import { Search, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import type { Payment } from '@/types';

const PAGE_SIZE = 15;

function PaidBadge({ paid }: { paid: boolean }) {
  return paid
    ? <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded"><CheckCircle2 size={11} /> Confirmado</span>
    : <span className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded"><Clock size={11} /> Pendente</span>;
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = usePayments();
  const allPayments: Payment[] = data?.data ?? [];

  const filtered = useMemo(() => {
    if (!search) return allPayments;
    const q = search.toLowerCase();
    return allPayments.filter(
      (p) => p.invoice_id?.toLowerCase().includes(q) ||
             p.order?.id?.toLowerCase().includes(q) ||
             p.order_id?.toLowerCase().includes(q) ||
             p.tx_hash?.toLowerCase().includes(q),
    );
  }, [allPayments, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    {
      key: 'invoice', header: 'Invoice ID',
      render: (p: Payment) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs">{p.invoice_id?.slice(0, 12)}…</span>
          <CopyButton value={p.invoice_id} />
        </div>
      ),
    },
    {
      key: 'order', header: 'Order ID',
      render: (p: Payment) => {
        const id = p.order?.id ?? p.order_id ?? '—';
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{id.slice(0, 8)}…</span>
            <CopyButton value={id} />
          </div>
        );
      },
    },
    {
      key: 'address', header: 'Endereço',
      render: (p: Payment) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">
            {truncateAddress(p.payment_address)}
          </span>
          {p.payment_address && <CopyButton value={p.payment_address} />}
        </div>
      ),
    },
    {
      key: 'amount', header: 'Valor Cripto',
      render: (p: Payment) => (
        <span className="font-mono text-xs font-medium">{p.payment_amount}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (p: Payment) => <PaidBadge paid={!!p.paid_at} />,
    },
    {
      key: 'tx', header: 'TX Hash',
      render: (p: Payment) => {
        if (!p.tx_hash) return <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>;
        const currency = p.order?.currency ?? 'ETH';
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-green-400">{p.tx_hash.slice(0, 10)}…</span>
              <CopyButton value={p.tx_hash} />
            </div>
            <a
              href={getExplorerUrl(currency, p.tx_hash)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Ver no Explorer"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        );
      },
    },
    {
      key: 'paid_at', header: 'Pago em',
      render: (p: Payment) => (
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(p.paid_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por invoice, order ID ou TX hash…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{filtered.length} pagamentos</span>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : (
        <>
          <Table
            columns={columns}
            data={paginated}
            keyExtractor={(p) => p.id}
            emptyMessage="Nenhum pagamento encontrado"
          />
          <Pagination page={page} total={filtered.length} limit={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </div>
  );
}
