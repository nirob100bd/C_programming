import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-2.5" aria-label="CForge dashboard">
      <span className="grid size-9 place-items-center rounded-xl bg-[rgb(var(--accent))] font-mono text-sm font-black text-white shadow-md dark:text-slate-950">
        C_
      </span>
      {!compact && <span className="text-lg font-black tracking-tight">CForge</span>}
    </Link>
  );
}
