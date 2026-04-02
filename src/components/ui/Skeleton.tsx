import clsx from 'clsx';

function Bone({ className }: { className?: string }) {
  return (
    <div className={clsx('animate-pulse rounded bg-[hsl(var(--muted))]', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Bone className="h-3 w-24" />
        <Bone className="h-8 w-8 rounded-lg" />
      </div>
      <Bone className="h-7 w-32" />
      <Bone className="h-3 w-20" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        {Array.from({ length: cols }).map((_, i) => (
          <Bone key={i} className="h-3" style={{ width: `${60 + Math.random() * 40}%`, flex: 1 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {Array.from({ length: cols }).map((_, c) => (
            <Bone key={c} className="h-4" style={{ width: `${40 + Math.random() * 50}%`, flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="animate-pulse flex items-end gap-2 px-2" style={{ height }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-[hsl(var(--muted))]"
          style={{ height: `${20 + Math.random() * 70}%` }}
        />
      ))}
    </div>
  );
}
