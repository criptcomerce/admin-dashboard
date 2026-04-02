'use client';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, CurrencyBadge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { useOrderWithPayment } from '@/hooks/useOrders';
import { PageLoader } from '@/components/ui/Loader';
import { formatDate, formatUSD, truncateAddress } from '@/lib/auth';
import { CheckCircle2, Clock, XCircle, Hash, Wallet, Calendar, DollarSign } from 'lucide-react';
import type { OrderStatus } from '@/types';

interface Props { orderId: string; onClose: () => void }

const timelineSteps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'PENDING', label: 'Pedido criado — aguardando pagamento', icon: Clock },
  { status: 'PAID',    label: 'Pagamento confirmado na blockchain',   icon: CheckCircle2 },
  { status: 'EXPIRED', label: 'Pedido expirado sem pagamento',        icon: XCircle },
];

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{label}</span>
      <span className={`text-sm text-[hsl(var(--foreground))] ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

export function OrderDetailModal({ orderId, onClose }: Props) {
  const { order, payment, isLoading } = useOrderWithPayment(orderId);

  return (
    <Modal open={!!orderId} onClose={onClose} title="Detalhes do Pedido" size="xl">
      {isLoading ? (
        <PageLoader />
      ) : !order ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Pedido não encontrado.</p>
      ) : (
        <div className="space-y-6">
          {/* Header do pedido */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={order.status} />
                <CurrencyBadge currency={order.currency} />
              </div>
              <p className="font-mono text-xs text-[hsl(var(--muted-foreground))] mt-2 flex items-center gap-1.5">
                {order.id}
                <CopyButton value={order.id} />
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                {formatUSD(Number(order.amount_usd))}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Valor do pedido</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Dados do pedido */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={12} /> Pedido
              </h3>
              <Field label="ID" value={<span className="font-mono text-xs">{order.id}</span>} />
              <Field label="Moeda" value={<CurrencyBadge currency={order.currency} />} />
              <Field label="Valor (USD)" value={formatUSD(Number(order.amount_usd))} />
              <Field label="Criado em" value={formatDate(order.created_at)} />
              <Field label="Atualizado em" value={formatDate(order.updated_at)} />
            </div>

            {/* Dados do pagamento */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-2">
                <Wallet size={12} /> Pagamento (NOWPayments)
              </h3>
              {payment ? (
                <>
                  <Field label="Invoice ID" value={
                    <span className="flex items-center gap-1.5 font-mono text-xs">
                      {payment.invoice_id}
                      <CopyButton value={payment.invoice_id} />
                    </span>
                  } />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Endereço</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-[hsl(var(--foreground))]">
                        {truncateAddress(payment.payment_address)}
                      </span>
                      <CopyButton value={payment.payment_address} />
                    </div>
                  </div>
                  <Field label="Valor Cripto" value={`${payment.payment_amount} ${order.currency}`} mono />
                  <Field label="Expira em" value={formatDate(payment.expiration_time)} />
                  <Field label="Pago em" value={formatDate(payment.paid_at)} />
                </>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Sem dados de pagamento</p>
              )}
            </div>
          </div>

          {/* TX Hash */}
          {payment?.tx_hash && (
            <div className="p-3 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={12} className="text-[hsl(var(--muted-foreground))]" />
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">TX Hash (Blockchain)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-green-400 break-all">{payment.tx_hash}</span>
                <CopyButton value={payment.tx_hash} />
              </div>
            </div>
          )}

          {/* Timeline de status */}
          <div>
            <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={12} /> Timeline
            </h3>
            <div className="space-y-2">
              {timelineSteps
                .filter((s) => s.status === 'PENDING' || s.status === order.status)
                .map((step) => {
                  const Icon = step.icon;
                  const isActive = step.status === order.status;
                  const isDone = step.status === 'PENDING' && order.status !== 'PENDING';
                  return (
                    <div key={step.status} className={`flex items-center gap-3 p-2.5 rounded-lg ${isActive ? 'bg-[hsl(var(--muted))]' : ''}`}>
                      <Icon size={14} className={
                        isActive && order.status === 'PAID' ? 'text-green-400' :
                        isActive && order.status === 'EXPIRED' ? 'text-red-400' :
                        isDone ? 'text-green-400' : 'text-[hsl(var(--muted-foreground))]'
                      } />
                      <span className={`text-sm ${isActive ? 'text-[hsl(var(--foreground))] font-medium' : 'text-[hsl(var(--muted-foreground))]'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
