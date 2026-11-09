export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3" role="status">
      <span className="size-5 animate-spin rounded-full border-2 border-[rgb(var(--border))] border-t-[rgb(var(--accent))]" />
      <span className="muted text-sm font-semibold">{label}…</span>
    </div>
  );
}
