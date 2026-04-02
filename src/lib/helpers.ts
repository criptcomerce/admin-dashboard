import type { OrderCurrency } from '@/types';

/** Gera URL do explorador blockchain para um TX hash */
export function getExplorerUrl(currency: OrderCurrency | string, txHash: string): string {
  switch (currency?.toUpperCase()) {
    case 'BTC':
      return `https://www.blockchain.com/explorer/transactions/btc/${txHash}`;
    case 'ETH':
    case 'USDT':  // USDT é ERC-20, vive no Ethereum
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
}

/** Tempo relativo legível (ex: "há 3 minutos") */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)   return 'agora mesmo';
  if (mins  < 60)  return `há ${mins} min`;
  if (hours < 24)  return `há ${hours}h`;
  if (days  < 30)  return `há ${days}d`;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(iso));
}

/** Formata valor USD */
export function formatUSD(value: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value));
}

/** Trunca endereço blockchain */
export function truncateAddress(addr: string | null | undefined): string {
  if (!addr) return '—';
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

/** Formata data/hora completa */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}
