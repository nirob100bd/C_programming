"use client";

import Link from "next/link";
import useSWR from "swr";
import { useDeferredValue, useState } from "react";
import { ArrowRight, Filter, Search, Swords, Timer, Tags } from "lucide-react";
import { fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface Problem { id: string; slug: string; title: string; difficulty: string; tags: string[]; expectedComplexity: string; }
const difficulties = ["introductory", "beginner", "easy", "intermediate", "advanced", "expert", "master"];
const difficultyStyle: Record<string, string> = {
  introductory: "text-sky-600 bg-sky-500/10",
  beginner: "text-teal-600 bg-teal-500/10",
  easy: "text-emerald-600 bg-emerald-500/10",
  intermediate: "text-amber-600 bg-amber-500/10",
  advanced: "text-orange-600 bg-orange-500/10",
  expert: "text-rose-600 bg-rose-500/10",
  master: "text-violet-600 bg-violet-500/10"
};

export default function ArenaPage() {
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const deferredTag = useDeferredValue(tag.trim().toLowerCase());
  const query = new URLSearchParams();
  if (difficulty) query.set("difficulty", difficulty);
  if (deferredTag) query.set("tag", deferredTag);
  const { data, error, isLoading, mutate } = useSWR<Problem[]>(`/api/problems${query.size ? `?${query}` : ""}`, fetcher);

  return (
    <div className="container-page">
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl"><p className="eyebrow">Independent practice</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Problem arena</h1><p className="muted mt-4 text-lg leading-8">Translate constraints into an algorithm, submit real C, and let hidden tests challenge your assumptions.</p></div>
        <div className="card flex items-center gap-3 p-4"><span className="grid size-10 place-items-center rounded-xl bg-rose-500/10 text-rose-500"><Swords size={20} /></span><div><div className="text-sm font-black">No partial simulation</div><div className="muted text-xs">Every verdict comes from Judge0</div></div></div>
      </section>

      <section className="card mt-8 flex flex-col gap-3 p-4 sm:flex-row">
        <label className="relative flex-1"><Search size={17} className="muted absolute left-3 top-3.5" /><span className="sr-only">Filter by exact tag</span><input className="input pl-10" placeholder="Exact tag, e.g. greedy" value={tag} onChange={(event) => setTag(event.target.value)} /></label>
        <label className="relative sm:w-56"><Filter size={16} className="muted absolute left-3 top-3.5" /><span className="sr-only">Difficulty</span><select className="input appearance-none pl-10" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">All difficulties</option>{difficulties.map((item) => <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>)}</select></label>
      </section>

      <div className="mt-5">
        {isLoading && <LoadingState label="Loading challenges" />}
        {error && <ErrorState message={error.message} retry={() => mutate()} />}
        {data?.length === 0 && <EmptyState icon={Swords} title="No matching problems" description="Clear a filter or run the seed to add the challenge catalog." />}
        <div className="grid gap-3">
          {data?.map((problem, index) => (
            <Link key={problem.id} href={`/arena/${problem.slug}`} className="card group grid items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]/50 sm:grid-cols-[52px_1fr_auto] sm:p-5">
              <span className="mono hidden size-10 place-items-center rounded-xl bg-[rgb(var(--card-strong))] text-xs font-black sm:grid">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-black group-hover:text-[rgb(var(--accent))]">{problem.title}</h2><span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${difficultyStyle[problem.difficulty] ?? "muted bg-[rgb(var(--card-strong))]"}`}>{problem.difficulty}</span></div><div className="muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"><span className="flex items-center gap-1"><Tags size={13} /> {problem.tags.join(" · ")}</span>{problem.expectedComplexity && <span className="flex items-center gap-1"><Timer size={13} /> {problem.expectedComplexity}</span>}</div></div>
              <span className="ml-auto flex items-center gap-1 text-xs font-black text-[rgb(var(--accent))]">Solve <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
