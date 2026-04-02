'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderWithPayment } from '@/hooks/useOrders';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge, CurrencyBadge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { Card } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatUSD, formatDate, truncateAddress, getExplorerUrl } from '@/lib/helpers';
import {
  ArrowLeft, Hash, Wallet, Calendar,
  DollarSign, CheckCircle2, Clock, XCircle, ExternalLink,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">
        {label}
      </span>
      <div className="text-sm text-[hsl(var(--foreground))]">{children}</div>
    </div>
  );
}

const timelineSteps: { status: OrderStatus; label: string; sub: string; icon: React.ElementType }[] = [
  { status: 'PENDING', label: 'Pedido criado',         sub: 'Aguardando pagamento',               icon: Clock         },
  { status: 'PAID',    label: 'Pagamento confirmado',  sub: 'Transação verificada na blockchain', icon: CheckCircle2  },
  { status: 'EXPIRED', label: 'Pedido expirado',       sub: 'Tempo limite atingido',              icon: XCircle       },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const { order, payment, isLoading } = useOrderWithPayment(id);

  return (
    <DashboardLayout title="Detalhes do Pedido">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft size={15} /> Voltar
        </button>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : !order ? (
          <Card>
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">
              Pedido não encontrado.
            </p>
          </Card>
        ) : (
          <>
            {/* Header */}
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={order.status} />
                  <CurrencyBadge currency={order.currency} />
                  <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                    {order.id}
                    <CopyButton value={order.id} />
                  </span>
                </div>
                <p className="text-3xl font-semibold">{formatUSD(order.amount_usd)}</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dados do pedido */}
              <Card>
                <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-2 mb-4">
                  <DollarSign size={12} /> Pedido
                </h3>
                <div className="space-y-4">
                  <Field label="ID">
                    <span className="font-mono text-xs flex items-center gap-1.5">
                      {order.id} <CopyButton value={order.id} />
                    </span>
                  </Field>
                  <Field label="Valor">{formatUSD(order.amount_usd)}</Field>
                  <Field label="Moeda"><CurrencyBadge currency={order.currency} /></Field>
                  <Field label="Status"><StatusBadge status={order.status} /></Field>
                  <Field label="Criado em">{formatDate(order.created_at)}</Field>
                  <Field label="Atualizado em">{formatDate(order.updated_at)}</Field>
                </div>
              </Card>

              {/* Dados do pagamento */}
              <Card>
                <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Wallet size={12} /> Pagamento
                </h3>
                {payment ? (
                  <div className="space-y-4">
                    <Field label="Invoice ID">
                      <span className="font-mono text-xs flex items-center gap-1.5">
                        {payment.invoice_id}
                        <CopyButton value={payment.invoice_id} />
                      </span>
                    </Field>
                    <Field label="Endereço">
                      <span className="font-mono text-xs flex items-center gap-1.5">
                        {truncateAddress(payment.payment_address)}
                        <CopyButton value={payment.payment_address} />
                      </span>
                    </Field>
                    <Field label="Valor Cripto">
                      <span className="font-mono">{payment.payment_amount} {order.currency}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1.5">
                        ≈ {formatUSD(order.amount_usd)}
                      </span>
                    </Field>
                    <Field label="Expira em">{formatDate(payment.expiration_time)}</Field>
                    <Field label="Pago em">{formatDate(payment.paid_at)}</Field>
                  </div>
                ) : (
                  <p className="text-sm text-[hsl(var(--muted-foreground))] py-4">
                    Sem dados de pagamento
                  </p>
                )}
              </Card>
            </div>

            {/* TX Hash com link para explorer */}
            {payment?.tx_hash && (
              <Card>
                <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Hash size={12} /> TX Hash — Blockchain
                </h3>
                <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]">
                  <span className="font-mono text-xs text-green-400 break-all flex-1">
                    {payment.tx_hash}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <CopyButton value={payment.tx_hash} label="Copiar" />
                    <a
                      href={getExplorerUrl(order.currency, payment.tx_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Ver no Explorer
                    </a>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex items-center gap-2 mb-4">
                <Calendar size={12} /> Timeline
              </h3>
              <div className="flex flex-col gap-1">
                {timelineSteps
                  .filter((s) => s.status === 'PENDING' || s.status === order.status)
                  .map((step, idx, arr) => {
                    const Icon     = step.icon;
                    const isActive = step.status === order.status;
                    const isDone   = step.status === 'PENDING' && arr.length > 1;
                    const color =
                      isActive && order.status === 'PAID'    ? 'text-green-400' :
                      isActive && order.status === 'EXPIRED' ? 'text-red-400'   :
                      isActive                               ? 'text-yellow-400':
                      isDone                                 ? 'text-green-400' :
                                                               'text-[hsl(var(--muted-foreground))]';
                    return (
                      <div key={step.status} className={`flex items-start gap-3 p-3 rounded-lg ${isActive ? 'bg-[hsl(var(--muted))]' : ''}`}>
                        <Icon size={15} className={`mt-0.5 flex-shrink-0 ${color}`} />
                        <div>
                          <p className={`text-sm font-medium ${isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{step.sub}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
