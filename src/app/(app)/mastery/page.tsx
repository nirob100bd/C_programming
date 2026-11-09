"use client";

import useSWR from "swr";
import { BrainCircuit, CalendarClock, CheckCircle2, CircleDashed, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface Skill {
  key: string; name: string; world: string; description: string;
  mastery: { score: number; state: string; updatedAt: string } | null;
}
interface Revision { id: string; skillKey: string; dueAt: string; attempts: number; }
interface MasteryPayload { skills: Skill[]; revisions: Revision[]; }

function scoreColor(score: number) {
  if (score >= 90) return "bg-violet-500";
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-sky-500";
  if (score > 0) return "bg-amber-500";
  return "bg-[rgb(var(--border))]";
}

export default function MasteryPage() {
  const { data, error, isLoading, mutate } = useSWR<MasteryPayload>("/api/mastery", fetcher);
  if (isLoading) return <div className="container-page"><LoadingState label="Building your skill model" /></div>;
  if (error) return <div className="container-page"><ErrorState message={error.message} retry={() => mutate()} /></div>;
  if (!data?.skills.length) return <div className="container-page"><EmptyState icon={BrainCircuit} title="No skills are seeded" description="Run the Prisma seed to populate the CForge skill graph." /></div>;

  const assessed = data.skills.filter((skill) => skill.mastery);
  const average = assessed.length ? Math.round(assessed.reduce((sum, skill) => sum + (skill.mastery?.score ?? 0), 0) / assessed.length) : 0;
  const mastered = assessed.filter((skill) => (skill.mastery?.score ?? 0) >= 90).length;
  const grouped = data.skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    (groups[skill.world] ??= []).push(skill);
    return groups;
  }, {});
  const names = new Map(data.skills.map((skill) => [skill.key, skill.name]));

  return (
    <div className="container-page space-y-7">
      <section className="max-w-3xl"><p className="eyebrow">Evidence, not checkboxes</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Skill mastery</h1><p className="muted mt-4 text-lg leading-8">Every score is reconstructed from recent predictions, traces, quizzes, code, debugging, optimization, and hintless transfer.</p></section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-sky-500/10 text-sky-500"><TrendingUp size={21} /></span><div><div className="text-2xl font-black">{average}%</div><div className="muted text-xs font-bold">Assessed average</div></div></div>
        <div className="card flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-violet-500/10 text-violet-500"><CheckCircle2 size={21} /></span><div><div className="text-2xl font-black">{mastered}</div><div className="muted text-xs font-bold">Mastered skills</div></div></div>
        <div className="card flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-amber-500/10 text-amber-500"><CalendarClock size={21} /></span><div><div className="text-2xl font-black">{data.revisions.length}</div><div className="muted text-xs font-bold">Due revisions</div></div></div>
      </section>

      {data.revisions.length > 0 && <section className="card border-amber-500/30 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500"><CalendarClock size={19} /></span><div><h2 className="font-black">Revision queue</h2><p className="muted text-xs">Incorrect evidence schedules retrieval after one day.</p></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{data.revisions.map((revision) => <div key={revision.id} className="card-subtle flex items-center justify-between gap-3 p-3 text-sm"><span className="font-bold">{names.get(revision.skillKey) ?? revision.skillKey}</span><span className="muted text-xs">due {formatDistanceToNow(new Date(revision.dueAt), { addSuffix: true })}</span></div>)}</div></section>}

      <div className="space-y-8">
        {Object.entries(grouped).map(([world, skills]) => (
          <section key={world}>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-black">{world}</h2><span className="muted text-xs font-bold">{skills.filter((skill) => skill.mastery).length}/{skills.length} assessed</span></div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {skills.map((skill) => {
                const score = skill.mastery?.score ?? 0;
                return <article key={skill.key} className="card p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-black">{skill.name}</h3><code className="mono muted text-[10px]">{skill.key}</code></div>{skill.mastery ? <span className="badge shrink-0">{skill.mastery.state}</span> : <CircleDashed size={18} className="muted shrink-0" />}</div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[rgb(var(--card-strong))]"><div className={`h-full rounded-full transition-all ${scoreColor(score)}`} style={{ width: `${Math.max(score, score ? 3 : 0)}%` }} /></div><div className="muted mt-2 flex justify-between text-xs"><span>{skill.mastery ? `${score}% evidence score` : "Not assessed"}</span>{skill.mastery && <span>updated {formatDistanceToNow(new Date(skill.mastery.updatedAt), { addSuffix: true })}</span>}</div></article>;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
