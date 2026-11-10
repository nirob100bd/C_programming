"use client";

import Link from "next/link";
import useSWR from "swr";
import { format } from "date-fns";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  Bug,
  Calendar,
  CalendarCheck,
  Calculator,
  Check,
  Compass,
  Dumbbell,
  Flag,
  Gem,
  Grid2x2,
  Hammer,
  Hand,
  HelpCircle,
  Layers,
  Link2,
  List,
  Medal,
  Moon,
  Mountain,
  Network,
  Repeat,
  Rocket,
  Search,
  Share2,
  SortAsc,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
  Type,
  Zap,
  type LucideIcon
} from "lucide-react";
import { fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  hidden: boolean;
  earned: boolean;
  earnedAt: string | null;
}

const icons: Record<string, LucideIcon> = {
  rocket: Rocket,
  check: Check,
  "arrow-right": ArrowRight,
  layers: Layers,
  bug: Bug,
  zap: Zap,
  link: Link2,
  "share-2": Share2,
  award: Award,
  target: Target,
  elephant: Trophy,
  calendar: Calendar,
  "book-open": BookOpen,
  "help-circle": HelpCircle,
  dumbbell: Dumbbell,
  hand: Hand,
  compass: Compass,
  activity: Activity,
  repeat: Repeat,
  search: Search,
  grid: Grid2x2,
  list: List,
  type: Type,
  calculator: Calculator,
  sort: SortAsc,
  mountain: Mountain,
  network: Network,
  sparkles: Sparkles,
  gem: Gem,
  "calendar-check": CalendarCheck,
  medal: Medal,
  moon: Moon,
  bookmark: Bookmark,
  sunrise: Sunrise,
  hammer: Hammer,
  flag: Flag,
  trophy: Trophy
};

/** Deterministic accent per achievement so the grid stays colourful but stable. */
const accents = [
  "from-teal-500/25 to-emerald-500/5 text-teal-600 dark:text-teal-300",
  "from-sky-500/25 to-indigo-500/5 text-sky-600 dark:text-sky-300",
  "from-violet-500/25 to-fuchsia-500/5 text-violet-600 dark:text-violet-300",
  "from-amber-500/25 to-orange-500/5 text-amber-600 dark:text-amber-300",
  "from-rose-500/25 to-pink-500/5 text-rose-600 dark:text-rose-300",
  "from-lime-500/25 to-teal-500/5 text-lime-600 dark:text-lime-300"
];

function accentFor(key: string) {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) % 997;
  return accents[hash % accents.length];
}

export default function AchievementsPage() {
  const { data, error, isLoading, mutate } = useSWR<Achievement[]>("/api/achievements", fetcher);

  if (isLoading) return <div className="container-page"><LoadingState label="Loading achievements" /></div>;
  if (error) return <div className="container-page"><ErrorState message={error.message} retry={() => mutate()} /></div>;
  if (!data?.length) {
    return (
      <div className="container-page">
        <EmptyState
          icon={Trophy}
          title="No achievements are seeded"
          description="Run npm run prisma:seed to install the achievement catalog."
        />
      </div>
    );
  }

  const earned = data.filter((item) => item.earned);
  const locked = data.filter((item) => !item.earned);
  const percent = Math.round((earned.length / data.length) * 100);
  const latest = [...earned]
    .sort((left, right) => (right.earnedAt ?? "").localeCompare(left.earnedAt ?? ""))
    .slice(0, 3);

  return (
    <div className="container-page space-y-8">
      <section className="max-w-3xl">
        <p className="eyebrow">Milestones, not participation medals</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Achievements</h1>
        <p className="muted mt-4 text-lg leading-8">
          Every badge is earned from real evidence: compiler-accepted runs, judged submissions,
          hintless solves, mastery states, and practice streaks. Nothing here is awarded for
          clicking.
        </p>
      </section>

      <section className="card overflow-hidden p-0">
        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{earned.length}</span>
              <span className="muted text-sm font-bold">of {data.length} unlocked</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[rgb(var(--card-strong))]" role="presentation">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--accent))] to-sky-400 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="muted mt-2 text-xs font-bold">{percent}% complete</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {latest.map((item) => {
              const Icon = icons[item.icon] ?? Trophy;
              return (
                <span key={item.id} className="badge max-w-56 truncate">
                  <Icon size={13} /> {item.name}
                </span>
              );
            })}
            {latest.length === 0 && <span className="muted text-sm font-semibold">Run your first program to start the collection.</span>}
          </div>
        </div>
      </section>

      {[
        { title: `Unlocked (${earned.length})`, items: earned, unlocked: true },
        { title: `Locked (${locked.length})`, items: locked, unlocked: false }
      ].map((group) => (
        <section key={group.title} aria-labelledby={`group-${group.unlocked ? "earned" : "locked"}`}>
          <h2 id={`group-${group.unlocked ? "earned" : "locked"}`} className="section-title mb-4">
            {group.title}
          </h2>
          {group.items.length === 0 ? (
            <p className="card p-5 text-sm font-semibold muted">
              {group.unlocked ? "Nothing unlocked yet. Your first accepted run is one click away." : "Everything is unlocked. Impressive."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((achievement) => {
                const Icon = icons[achievement.icon] ?? Trophy;
                const accent = accentFor(achievement.key);
                return (
                  <article
                    key={achievement.id}
                    className={`card relative overflow-hidden p-5 transition ${
                      achievement.earned
                        ? "hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]/45"
                        : "opacity-65 grayscale hover:opacity-90"
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${
                        achievement.earned ? accent : "from-slate-400/10 to-transparent"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <span
                        className={`grid size-12 shrink-0 place-items-center rounded-2xl border ${
                          achievement.earned
                            ? "border-white/40 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10"
                            : "border-[rgb(var(--border))] bg-[rgb(var(--card-strong))]"
                        }`}
                      >
                        <Icon size={22} className={achievement.earned ? accent.split(" ").slice(-2).join(" ") : "muted"} />
                      </span>
                      {achievement.earned ? (
                        <span className="badge border-emerald-500/30 bg-emerald-500/10 text-[rgb(var(--success))]">
                          <Check size={12} /> Earned
                        </span>
                      ) : (
                        <span className="badge">Locked</span>
                      )}
                    </div>
                    <h3 className="mt-4 text-base font-black">{achievement.name}</h3>
                    <p className="muted mt-1.5 text-sm leading-6">{achievement.description}</p>
                    <p className="mono muted mt-4 text-[10px] uppercase tracking-wider">
                      {achievement.earned && achievement.earnedAt
                        ? `Earned ${format(new Date(achievement.earnedAt), "d MMM yyyy")}`
                        : achievement.key}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ))}

      <section className="card flex flex-wrap items-center gap-3 p-5">
        <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]">
          <Compass size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-black">The next milestone is close</h2>
          <p className="muted text-xs font-semibold">
            Achievements are checked after every compiler run and every judged submission.
          </p>
        </div>
        <Link href="/arena" className="btn btn-secondary">Open the arena</Link>
      </section>
    </div>
  );
}
