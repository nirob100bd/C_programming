"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowRight, BookOpen, LockKeyhole, Map, Target } from "lucide-react";
import { fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  world: string;
  worldOrder: number;
  order: number;
  summary: string;
  objectives: unknown;
  prerequisites: string[];
}

const worldDescriptions: Record<number, string> = {
  0: "Learn to translate a problem into precise instructions and understand how source becomes an executable.",
  1: "Build fluency with values, input, decisions, repetition, and the core grammar of C.",
  2: "Reason about contiguous data, boundaries, text, searching, and sorting.",
  3: "Decompose programs with functions and understand recursive control flow.",
  4: "Develop a concrete model of addresses, indirection, arrays, and pointer safety.",
  5: "Design compound data and understand representation, padding, unions, and enums.",
  6: "Control heap lifetime, ownership, resizing, leaks, and dynamic structures.",
  7: "Work with files, compilation units, diagnostics, macros, and undefined behavior.",
  8: "Implement the structures that organize real algorithms.",
  9: "Analyze and design algorithms with proof and complexity in mind.",
  10: "Turn patterns and constraints into fast contest solutions.",
  11: "Use C at the boundary of operating systems, networking, concurrency, and security.",
  12: "Ship maintainable C with tests, builds, version control, and review discipline."
};

export default function WorldsPage() {
  const { data, error, isLoading, mutate } = useSWR<Lesson[]>("/api/lessons", fetcher);
  if (isLoading) return <div className="container-page"><LoadingState label="Charting the curriculum" /></div>;
  if (error) return <div className="container-page"><ErrorState message={error.message} retry={() => mutate()} /></div>;
  if (!data?.length) return <div className="container-page"><EmptyState icon={Map} title="The map is awaiting content" description="Run the idempotent Prisma seed to populate CForge lessons." /></div>;

  const grouped = data.reduce<Record<string, Lesson[]>>((groups, lesson) => {
    (groups[lesson.world] ??= []).push(lesson);
    return groups;
  }, {});
  const worlds = Object.entries(grouped).sort(([, a], [, b]) => a[0].worldOrder - b[0].worldOrder);

  return (
    <div className="container-page">
      <section className="max-w-3xl">
        <p className="eyebrow">Structured curriculum</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">The CForge world map</h1>
        <p className="muted mt-4 text-lg leading-8">Move in dependency order. Each world changes the kinds of programs you can reason about and build.</p>
      </section>

      <div className="relative mt-10 space-y-8 before:absolute before:bottom-8 before:left-5 before:top-8 before:w-px before:bg-[rgb(var(--border))] sm:before:left-7">
        {worlds.map(([world, lessons], worldIndex) => {
          const order = lessons[0].worldOrder;
          return (
            <section key={world} className="relative pl-14 sm:pl-20">
              <div className="absolute left-0 top-0 z-10 grid size-10 place-items-center rounded-2xl border border-[rgb(var(--accent))]/30 bg-[rgb(var(--bg))] font-mono text-xs font-black text-[rgb(var(--accent))] sm:size-14 sm:text-sm">
                {String(order).padStart(2, "0")}
              </div>
              <div className="card overflow-hidden">
                <div className="border-b border-[rgb(var(--border))] p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div><p className="text-xs font-black uppercase tracking-wider text-[rgb(var(--accent))]">World {order}</p><h2 className="mt-1 text-xl font-black sm:text-2xl">{world.replace(/^World \d+ — /, "")}</h2></div>
                    <span className="badge"><BookOpen size={13} /> {lessons.length} lesson{lessons.length === 1 ? "" : "s"}</span>
                  </div>
                  <p className="muted mt-3 max-w-3xl text-sm leading-6">{worldDescriptions[order] ?? "A focused stage in your C learning path."}</p>
                </div>
                <div className="grid gap-px bg-[rgb(var(--border))] sm:grid-cols-2 xl:grid-cols-3">
                  {lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                    <Link key={lesson.id} href={`/learn/${lesson.id}`} className="group flex min-h-36 flex-col bg-[rgb(var(--card))] p-5 transition hover:bg-[rgb(var(--accent))]/[.045]">
                      <div className="flex items-center justify-between"><span className="mono muted text-[11px] font-bold">{String(worldIndex + 1).padStart(2, "0")}.{String(lesson.order).padStart(2, "0")}</span>{lesson.prerequisites.length ? <LockKeyhole size={14} className="muted" aria-label="Has prerequisites" /> : <Target size={14} className="text-[rgb(var(--accent))]" />}</div>
                      <h3 className="mt-3 font-black group-hover:text-[rgb(var(--accent))]">{lesson.title}</h3>
                      <p className="muted mt-1 line-clamp-2 text-xs leading-5">{lesson.summary || "Open the lesson to begin."}</p>
                      <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-black text-[rgb(var(--accent))]">Open lesson <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
