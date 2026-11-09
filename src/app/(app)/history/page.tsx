"use client";

import useSWR from "swr";
import { useState } from "react";
import { Activity, Clock3, Filter, History } from "lucide-react";
import { format } from "date-fns";
import { fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface ActivityItem { id: string; kind: string; payload: unknown; createdAt: string; }
const commonKinds = ["", "account.created", "progress.saved", "run", "problem.submitted"];

function description(item: ActivityItem) {
  const payload = typeof item.payload === "object" && item.payload !== null ? item.payload as Record<string, unknown> : {};
  if (item.kind === "run") return `Compiler verdict: ${String(payload.verdict ?? "recorded")}`;
  if (item.kind === "problem.submitted") return `Problem verdict: ${String(payload.verdict ?? "recorded")}`;
  if (item.kind === "progress.saved") return "Lesson code and position autosaved";
  if (item.kind === "account.created") return "CForge learning account created";
  return "Learning activity recorded";
}

export default function HistoryPage() {
  const [kind, setKind] = useState("");
  const key = `/api/activity?take=200${kind ? `&kind=${encodeURIComponent(kind)}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR<ActivityItem[]>(key, fetcher);

  return (
    <div className="container-page">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Audit trail</p><h1 className="mt-2 text-4xl font-black tracking-tight">Learning history</h1><p className="muted mt-3 max-w-2xl">A chronological record of saves, compiler runs, and judged submissions.</p></div><label className="relative w-full sm:w-60"><Filter size={15} className="muted absolute left-3 top-3.5" /><span className="sr-only">Filter activity kind</span><select className="input pl-9" value={kind} onChange={(event) => setKind(event.target.value)}>{commonKinds.map((item) => <option key={item || "all"} value={item}>{item || "All activity"}</option>)}</select></label></section>
      <div className="mt-8">
        {isLoading && <LoadingState label="Reading activity" />}
        {error && <ErrorState message={error.message} retry={() => mutate()} />}
        {data?.length === 0 && <EmptyState icon={History} title="No activity yet" description="Open a lesson or run a program to begin your history." />}
        {data && data.length > 0 && <ol className="relative ml-4 border-l border-[rgb(var(--border))] sm:ml-6">{data.map((item) => <li key={item.id} className="relative pb-6 pl-8"><span className="absolute -left-4 top-0 grid size-8 place-items-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--accent))]"><Activity size={14} /></span><article className="card p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><code className="mono text-xs font-black text-[rgb(var(--accent))]">{item.kind}</code><p className="mt-1 text-sm font-semibold">{description(item)}</p></div><time dateTime={item.createdAt} className="muted flex items-center gap-1 text-xs"><Clock3 size={12} /> {format(new Date(item.createdAt), "PPp")}</time></div></article></li>)}</ol>}
      </div>
    </div>
  );
}
