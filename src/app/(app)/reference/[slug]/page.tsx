"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Bookmark, Braces, Copy } from "lucide-react";
import { apiFetch, fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

interface Entry { id: string; slug: string; category: string; title: string; body: string; examples: unknown; }

export default function ReferenceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, error, isLoading, mutate } = useSWR<Entry>(`/api/reference/${slug}`, fetcher);
  if (isLoading) return <div className="container-page"><LoadingState label="Opening reference" /></div>;
  if (error) return <div className="container-page"><ErrorState message={error.message} retry={() => mutate()} /></div>;
  if (!data) return null;
  const examples = Array.isArray(data.examples) ? data.examples.filter((item): item is string => typeof item === "string") : [];

  async function bookmark() {
    await apiFetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "reference", refId: data!.slug }) });
  }

  return (
    <div className="container-page max-w-4xl">
      <Link href="/reference" className="muted inline-flex items-center gap-1.5 text-xs font-bold hover:text-[rgb(var(--accent))]"><ArrowLeft size={14} /> Reference index</Link>
      <article className="card mt-5 overflow-hidden"><header className="border-b border-[rgb(var(--border))] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="badge"><Braces size={12} /> {data.category}</span><h1 className="mono mt-4 text-4xl font-black tracking-tight">{data.title}</h1></div><button type="button" onClick={bookmark} className="btn btn-secondary"><Bookmark size={16} /> Bookmark</button></div></header><div className="p-6 sm:p-8"><div className="prose-cforge">{data.body}</div>{examples.length > 0 && <section className="mt-8"><h2 className="text-sm font-black uppercase tracking-wider">Examples</h2><div className="mt-3 space-y-3">{examples.map((example) => <div key={example} className="group relative overflow-hidden rounded-xl bg-slate-950"><pre className="mono overflow-x-auto p-4 pr-12 text-sm leading-6 text-slate-100"><code>{example}</code></pre><button type="button" onClick={() => navigator.clipboard.writeText(example)} className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-white/10 text-slate-300 opacity-0 transition hover:bg-white/20 group-hover:opacity-100" aria-label="Copy example"><Copy size={14} /></button></div>)}</div></section>}</div></article>
    </div>
  );
}
