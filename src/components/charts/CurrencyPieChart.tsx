'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { BTC: '#f97316', USDT: '#14b8a6', ETH: '#6366f1' };

interface Props { data: { currency: string; amount: number }[] }

export function CurrencyPieChart({ data }: Props) {
  const filtered = data.filter((d) => d.amount > 0);
  if (filtered.length === 0) {
    return <div className="flex items-center justify-center h-[220px] text-sm text-[hsl(var(--muted-foreground))]">Sem dados ainda</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={filtered} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="amount" paddingAngle={3}>
          {filtered.map((entry) => (
            <Cell key={entry.currency} fill={COLORS[entry.currency as keyof typeof COLORS] ?? '#64748b'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'hsl(222 40% 9%)', border: '1px solid hsl(222 30% 16%)', borderRadius: 8, fontSize: 12 }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Receita']}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
