"use client";

import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, BookOpen, BrainCircuit, Clock3, Flame, Play, Swords, Trophy } from "lucide-react";
import { fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

interface Me { name: string | null; xp: number; rank: string; }
interface Recent {
  progress: { stepId: string; lastSavedAt: string };
  lesson: { id: string; title: string; world: string; steps: { id: string; title: string }[] };
}
interface Submission { id: string; verdict: string | null; createdAt: string; sourceCode: string; }
interface Mastery {
  skills: { key: string; name: string; world: string; mastery: { score: number; state: string } | null }[];
  revisions: { id: string; skillKey: string; dueAt: string }[];
}

const rankThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

export default function DashboardPage() {
  const me = useSWR<Me>("/api/me", fetcher);
  const recent = useSWR<Recent | null>("/api/progress/recent", fetcher);
  const submissions = useSWR<Submission[]>("/api/submissions?take=5", fetcher);
  const mastery = useSWR<Mastery>("/api/mastery", fetcher);

  if (me.isLoading) return <div className="container-page"><LoadingState label="Preparing your forge" /></div>;
  if (me.error) return <div className="container-page"><ErrorState message={me.error.message} retry={() => me.mutate()} /></div>;

  const currentXp = me.data?.xp ?? 0;
  const nextThreshold = rankThresholds.find((threshold) => threshold > currentXp);
  const previousThreshold = [...rankThresholds].reverse().find((threshold) => threshold <= currentXp) ?? 0;
  const rankProgress = nextThreshold
    ? Math.round(((currentXp - previousThreshold) / (nextThreshold - previousThreshold)) * 100)
    : 100;
  const continueHref = recent.data
    ? `/learn/${recent.data.lesson.id}?step=${recent.data.progress.stepId}`
    : "/worlds";
  const weakest = (mastery.data?.skills ?? [])
    .filter((skill) => skill.mastery)
    .sort((a, b) => (a.mastery?.score ?? 0) - (b.mastery?.score ?? 0))
    .slice(0, 4);

  return (
    <div className="container-page space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="absolute -right-20 -top-32 size-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-teal-300">Your learning command center</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Welcome back{me.data?.name ? `, ${me.data.name}` : ""}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">One focused session is enough to move the model forward. Resume the exact step you left.</p>
            <Link href={continueHref} className="btn mt-6 bg-teal-300 text-slate-950 hover:bg-teal-200">
              <Play size={17} fill="currentColor" /> {recent.data ? "Continue lesson" : "Start World 0"}
            </Link>
            {recent.data && <p className="mt-3 text-xs text-slate-400">{recent.data.lesson.title} · saved {formatDistanceToNow(new Date(recent.data.progress.lastSavedAt), { addSuffix: true })}</p>}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-5 backdrop-blur">
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current rank</p><p className="mt-1 text-xl font-black">{me.data?.rank ?? "Beginner"}</p></div>
              <span className="grid size-10 place-items-center rounded-xl bg-amber-300/10 text-amber-300"><Trophy size={20} /></span>
            </div>
            <div className="mt-5 flex justify-between text-xs font-bold"><span>{currentXp.toLocaleString()} XP</span><span className="text-slate-400">{nextThreshold ? `${nextThreshold - currentXp} to next rank` : "Top rank"}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-teal-300 transition-all" style={{ width: `${rankProgress}%` }} /></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/worlds" className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]/50">
          <span className="grid size-11 place-items-center rounded-xl bg-sky-500/10 text-sky-500"><BookOpen size={21} /></span><div><div className="font-black">Curriculum</div><div className="muted text-xs">Follow the world map</div></div><ArrowRight size={17} className="muted ml-auto transition group-hover:translate-x-1" />
        </Link>
        <Link href="/arena" className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]/50">
          <span className="grid size-11 place-items-center rounded-xl bg-rose-500/10 text-rose-500"><Swords size={21} /></span><div><div className="font-black">Problem arena</div><div className="muted text-xs">Test independent skill</div></div><ArrowRight size={17} className="muted ml-auto transition group-hover:translate-x-1" />
        </Link>
        <Link href="/labs/pointers" className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]/50">
          <span className="grid size-11 place-items-center rounded-xl bg-violet-500/10 text-violet-500"><BrainCircuit size={21} /></span><div><div className="font-black">Pointer lab</div><div className="muted text-xs">Make memory visible</div></div><ArrowRight size={17} className="muted ml-auto transition group-hover:translate-x-1" />
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="eyebrow">Practice signal</p><h2 className="mt-1 text-xl font-black">Skills to strengthen</h2></div><Link href="/mastery" className="text-sm font-bold text-[rgb(var(--accent))]">View all</Link></div>
          <div className="mt-5 space-y-4">
            {weakest.map((skill) => (
              <div key={skill.key}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="font-bold">{skill.name}</span><span className="muted text-xs">{skill.mastery?.state}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--card-strong))]"><div className="h-full rounded-full bg-[rgb(var(--accent))]" style={{ width: `${skill.mastery?.score ?? 0}%` }} /></div>
              </div>
            ))}
            {weakest.length === 0 && <div className="card-subtle p-5 text-center"><BrainCircuit className="mx-auto text-[rgb(var(--accent))]" size={24} /><p className="mt-2 text-sm font-bold">No evidence yet</p><p className="muted mt-1 text-xs">Complete quizzes and judged problems to build your skill model.</p></div>}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="eyebrow">Compiler trail</p><h2 className="mt-1 text-xl font-black">Recent submissions</h2></div><Link href="/history" className="text-sm font-bold text-[rgb(var(--accent))]">History</Link></div>
          <div className="mt-4 divide-y divide-[rgb(var(--border))]">
            {(submissions.data ?? []).map((submission) => (
              <div key={submission.id} className="flex items-center gap-3 py-3">
                <span className={`size-2 rounded-full ${submission.verdict === "Accepted" ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span className="mono min-w-0 flex-1 truncate text-xs">{submission.sourceCode.split("\n").find((line) => line.trim()) ?? "C submission"}</span>
                <span className={`text-xs font-black ${submission.verdict === "Accepted" ? "text-[rgb(var(--success))]" : "text-[rgb(var(--danger))]"}`}>{submission.verdict}</span>
              </div>
            ))}
            {submissions.data?.length === 0 && <p className="muted py-8 text-center text-sm">Your first compiler run will appear here.</p>}
          </div>
        </div>
      </section>

      {(mastery.data?.revisions.length ?? 0) > 0 && (
        <section className="card flex flex-col gap-4 border-amber-500/30 p-5 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500"><Clock3 size={21} /></span>
          <div className="flex-1"><div className="font-black">Revision is due</div><p className="muted text-sm">{mastery.data?.revisions.length} skill{mastery.data?.revisions.length === 1 ? "" : "s"} need another retrieval attempt.</p></div>
          <Link href="/mastery" className="btn btn-secondary">Review queue <ArrowRight size={16} /></Link>
        </section>
      )}

      <div className="muted flex items-center justify-center gap-2 py-2 text-xs font-semibold"><Flame size={14} className="text-orange-500" /> Consistency beats intensity. Make one piece of evidence today.</div>
    </div>
  );
}
