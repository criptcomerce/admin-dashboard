import clsx from 'clsx';
import type { OrderStatus, OrderCurrency } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PAID:    { label: 'Pago',      className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  PENDING: { label: 'Pendente',  className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  EXPIRED: { label: 'Expirado', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const currencyConfig: Record<OrderCurrency, { className: string }> = {
  BTC:  { className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  USDT: { className: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  ETH:  { className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

interface StatusBadgeProps { status: OrderStatus }
interface CurrencyBadgeProps { currency: OrderCurrency | string }

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border', cfg.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {cfg.label}
    </span>
  );
}

export function CurrencyBadge({ currency }: CurrencyBadgeProps) {
  const cfg = currencyConfig[currency as OrderCurrency] ?? { className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border', cfg.className)}>
      {currency}
    </span>
  );
}
