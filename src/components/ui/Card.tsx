import clsx from 'clsx';

interface CardProps { children: React.ReactNode; className?: string }

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5', className)}>
      {children}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  accent?: string;
}

export function MetricCard({ title, value, icon, trend, accent = 'text-blue-400' }: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{title}</p>
        <span className={clsx('p-2 rounded-lg bg-current/10', accent)}>
          <span className={accent}>{icon}</span>
        </span>
      </div>
      <div>
        <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{value}</p>
        {trend && (
          <p className={clsx('text-xs mt-1', trend.positive ? 'text-green-400' : 'text-red-400')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </Card>
  );
}
