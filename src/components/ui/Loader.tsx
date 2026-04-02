export function Loader({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--border))] border-t-blue-500 animate-spin" />
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <Loader />
    </div>
  );
}
