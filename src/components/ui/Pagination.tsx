'use client';
import clsx from 'clsx';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Mostrando {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} de {total}
      </p>
      <div className="flex gap-1">
        <PagBtn disabled={page <= 1} onClick={() => onChange(page - 1)}>← Anterior</PagBtn>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <PagBtn key={p} active={p === page} onClick={() => onChange(p)}>
              {p}
            </PagBtn>
          );
        })}
        <PagBtn disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Próximo →</PagBtn>
      </div>
    </div>
  );
}

function PagBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-3 py-1.5 text-xs rounded-lg border transition-colors',
        active
          ? 'bg-blue-500 border-blue-500 text-white'
          : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted-foreground))]',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}
