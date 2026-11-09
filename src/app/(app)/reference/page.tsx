"use client";

import Link from "next/link";
import useSWR from "swr";
import { useDeferredValue, useState } from "react";
import { ArrowRight, BookMarked, Braces, Search } from "lucide-react";
import { fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface Entry { id: string; slug: string; category: string; title: string; body: string; examples: unknown; }

export default function ReferencePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const deferred = useDeferredValue(query.trim());
  const params = new URLSearchParams();
  if (deferred) params.set("q", deferred);
  if (category) params.set("category", category);
  const { data, error, isLoading, mutate } = useSWR<Entry[]>(`/api/reference${params.size ? `?${params}` : ""}`, fetcher);
  const allQuery = useSWR<Entry[]>("/api/reference", fetcher);
  const categories = [...new Set((allQuery.data ?? []).map((entry) => entry.category))].sort();

  return (
    <div className="container-page">
      <section className="mx-auto max-w-3xl text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]"><BookMarked size={23} /></span><p className="eyebrow mt-5">Language and library guide</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">C reference</h1><p className="muted mt-4 text-lg">Search concise definitions, safety notes, signatures, and examples without leaving your learning environment.</p></section>
      <section className="card mx-auto mt-8 flex max-w-4xl flex-col gap-3 p-4 sm:flex-row"><label className="relative flex-1"><Search size={17} className="muted absolute left-3 top-3.5" /><span className="sr-only">Search reference</span><input className="input pl-10" placeholder="Search pointers, malloc, undefined behavior…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Reference category" className="input sm:w-48" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></section>
      <div className="mx-auto mt-6 max-w-4xl">
        {isLoading && <LoadingState label="Searching reference" />}
        {error && <ErrorState message={error.message} retry={() => mutate()} />}
        {data?.length === 0 && <EmptyState icon={Search} title="No matching entries" description="Try a broader term or clear the category filter." />}
        <div className="grid gap-3 sm:grid-cols-2">{data?.map((entry) => <Link key={entry.id} href={`/reference/${entry.slug}`} className="card group flex min-h-48 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]/50"><div className="flex items-center justify-between"><span className="badge"><Braces size={12} /> {entry.category}</span><ArrowRight size={16} className="muted transition group-hover:translate-x-1 group-hover:text-[rgb(var(--accent))]" /></div><h2 className="mono mt-4 text-lg font-black group-hover:text-[rgb(var(--accent))]">{entry.title}</h2><p className="muted mt-2 line-clamp-3 text-sm leading-6">{entry.body}</p><span className="mt-auto pt-4 text-xs font-black text-[rgb(var(--accent))]">Read entry</span></Link>)}</div>
      </div>
    </div>
  );
}
