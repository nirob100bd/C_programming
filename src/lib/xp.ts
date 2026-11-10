import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const RANKS = [
  [0, "Beginner"],
  [100, "C Explorer"],
  [300, "Programmer"],
  [600, "Problem Solver"],
  [1000, "Algorithm Designer"],
  [1500, "Systems Developer"],
  [2200, "Advanced C Engineer"],
  [3000, "Competitive Programmer"],
  [4000, "C Specialist"],
  [5500, "Elite Engineer"]
] as const;

export function rankFor(xp: number): string {
  let rank: string = RANKS[0][1];
  for (const [minimum, name] of RANKS) {
    if (xp >= minimum) rank = name;
  }
  return rank;
}

export async function awardXp(
  userId: string,
  amount: number,
  reason: string,
  ref: string
) {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  const key = `${userId}:${reason}:${ref}`;

  return prisma.$transaction(async (tx) => {
    const inserted = await tx.xpEvent.createMany({
      data: [{ userId, amount, reason, key }],
      skipDuplicates: true
    });

    if (inserted.count === 0) {
      return tx.xpEvent.findUnique({ where: { key } });
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } },
      select: { xp: true, rank: true }
    });
    const rank = rankFor(user.xp);
    if (rank !== user.rank) {
      await tx.user.update({ where: { id: userId }, data: { rank } });
    }

    return tx.xpEvent.findUnique({ where: { key } });
  });
}

/* -------------------------------------------------------------------------- */
/* Achievements                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Achievement keys. The seed owns the human-readable name, description, and
 * icon; this module owns the *rule* that earns each one, so the two lists must
 * stay in sync (a unit test checks that every rule key is seeded and every
 * seeded key has a rule).
 */
export const ACHIEVEMENT_KEYS = [
  "first.program",
  "first.lesson",
  "first.quiz",
  "code.25",
  "first.accepted",
  "five.accepted",
  "ten.accepted",
  "fifty.accepted",
  "first.end_to_end",
  "first.pointer",
  "first.dynamic_memory",
  "trace.master",
  "first.debug",
  "optimal.o1",
  "first.linked_list",
  "first.graph",
  "first.recursion",
  "first.binary_search",
  "first.dp",
  "array.lord",
  "string.weaver",
  "math.wizard",
  "sort.savant",
  "elephant.master",
  "hard.first",
  "polymath",
  "xp.500",
  "xp.2000",
  "streak.3",
  "streak.7",
  "rank.problem_solver",
  "night.owl",
  "early.bird",
  "collector.reference",
  "builder.projects",
  "completionist.world1"
] as const;

export type AchievementKey = (typeof ACHIEVEMENT_KEYS)[number];

export type EarnedAchievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
};

/**
 * Everything the rules need, gathered with a bounded number of queries. Passed
 * lesson steps are read from the XP ledger: `awardXp` stores one idempotent
 * event per (reason, step) pair, so the ledger is the authoritative record of
 * which steps actually produced a correct answer.
 */
export type AchievementFacts = {
  submissionCount: number;
  acceptedCount: number;
  distinctAcceptedProblems: number;
  hintlessAccepted: number;
  acceptedSkills: Set<string>;
  acceptedTags: Set<string>;
  acceptedSlugs: Set<string>;
  acceptedDifficulties: Set<string>;
  passedStepKinds: Set<string>;
  passedCodeSteps: number;
  correctQuizSteps: number;
  completedLessons: number;
  worldOneLessons: number;
  worldOneCompleted: number;
  masteredSkills: number;
  xp: number;
  activeDays: string[];
  notesAndBookmarks: number;
  projects: number;
  hourOfDay: number | null;
};

const MASTERY_STATE_WORTH_COUNTING = new Set([
  "Independent",
  "Transfer capable",
  "Mastered"
]);

const CODE_STEP_KINDS = new Set(["code", "debug", "build", "optimize", "trace"]);

/** Local calendar day key, so a streak follows the learner's day boundary. */
export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Longest run of consecutive calendar days present in `days`. */
export function currentStreak(days: string[]): number {
  const unique = [...new Set(days)].sort();
  if (unique.length === 0) return 0;
  let streak = 1;
  let best = 1;
  for (let index = 1; index < unique.length; index += 1) {
    const previous = Date.parse(`${unique[index - 1]}T00:00:00Z`);
    const current = Date.parse(`${unique[index]}T00:00:00Z`);
    streak = current - previous === 86_400_000 ? streak + 1 : 1;
    best = Math.max(best, streak);
  }
  return best;
}

/** Pure rule evaluation: given facts, which keys are earned? */
export function evaluateAchievements(facts: AchievementFacts): AchievementKey[] {
  const earned: AchievementKey[] = [];
  const hasSkill = (...keys: string[]) => keys.some((key) => facts.acceptedSkills.has(key));

  if (facts.submissionCount >= 1) earned.push("first.program");
  if (facts.completedLessons >= 1) earned.push("first.lesson");
  if (facts.correctQuizSteps >= 1) earned.push("first.quiz");
  if (facts.passedCodeSteps >= 25) earned.push("code.25");
  if (facts.acceptedCount >= 1) earned.push("first.accepted");
  if (facts.distinctAcceptedProblems >= 5) earned.push("five.accepted");
  if (facts.acceptedCount >= 10) earned.push("ten.accepted");
  if (facts.acceptedCount >= 50) earned.push("fifty.accepted");
  if (facts.hintlessAccepted >= 1) earned.push("first.end_to_end");
  if (hasSkill(
    "c.pointers.basic",
    "c.pointers.arithmetic",
    "c.pointers.arrays",
    "c.pointers.strings",
    "c.pointers.functions",
    "c.pointers.double",
    "c.pointers.function",
    "c.pointers.void",
    "c.pointers.const"
  )) earned.push("first.pointer");
  if (hasSkill("c.memory.malloc", "c.memory.calloc", "c.memory.realloc", "c.memory.dynamic_array")) {
    earned.push("first.dynamic_memory");
  }
  if (facts.passedStepKinds.has("debug")) earned.push("first.debug");
  if (facts.passedStepKinds.has("optimize")) earned.push("optimal.o1");
  if (hasSkill("ds.linked_list")) earned.push("first.linked_list");
  if (hasSkill("ds.graph", "algo.graph_algo")) earned.push("first.graph");
  if (hasSkill("c.recursion")) earned.push("first.recursion");
  if (hasSkill("algo.binary_search")) earned.push("first.binary_search");
  if (hasSkill("algo.dp", "cp.dp_advanced")) earned.push("first.dp");
  if (facts.acceptedTags.has("arrays")) earned.push("array.lord");
  if (facts.acceptedTags.has("strings")) earned.push("string.weaver");
  if (facts.acceptedTags.has("math") || facts.acceptedTags.has("number-theory")) earned.push("math.wizard");
  if (facts.acceptedTags.has("sorting")) earned.push("sort.savant");
  if (facts.acceptedSlugs.has("elephant")) earned.push("elephant.master");
  if (
    facts.acceptedDifficulties.has("advanced") ||
    facts.acceptedDifficulties.has("expert") ||
    facts.acceptedDifficulties.has("master")
  ) earned.push("hard.first");
  if (facts.masteredSkills >= 10) earned.push("polymath");
  if (facts.xp >= 500) earned.push("xp.500");
  if (facts.xp >= 2000) earned.push("xp.2000");
  const streak = currentStreak(facts.activeDays);
  if (streak >= 3) earned.push("streak.3");
  if (streak >= 7) earned.push("streak.7");
  if (facts.xp >= 600) earned.push("rank.problem_solver");
  if (facts.hourOfDay !== null && facts.hourOfDay >= 0 && facts.hourOfDay < 4) earned.push("night.owl");
  if (facts.hourOfDay !== null && facts.hourOfDay >= 5 && facts.hourOfDay < 7) earned.push("early.bird");
  if (facts.notesAndBookmarks >= 5) earned.push("collector.reference");
  if (facts.projects >= 1) earned.push("builder.projects");
  if (facts.worldOneLessons > 0 && facts.worldOneCompleted >= facts.worldOneLessons) {
    earned.push("completionist.world1");
  }

  return earned.filter((key) => (ACHIEVEMENT_KEYS as readonly string[]).includes(key));
}

/** The ref stored in an XP event key is the step id that earned it. */
function refOfKey(key: string) {
  const parts = key.split(":");
  return parts.length >= 3 ? parts.slice(2).join(":") : "";
}

export async function collectAchievementFacts(userId: string): Promise<AchievementFacts> {
  const [
    user,
    submissionCount,
    accepted,
    recentSubmission,
    lessonSteps,
    lessons,
    completed,
    mastery,
    activities,
    notes,
    bookmarks,
    projects
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true } }),
    prisma.submission.count({ where: { userId } }),
    prisma.submission.findMany({
      where: { userId, verdict: "Accepted" },
      select: { problemId: true, mode: true, hintsUsed: true }
    }),
    prisma.submission.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, mode: true }
    }),
    prisma.lessonStep.findMany({ select: { id: true, kind: true } }),
    prisma.lesson.findMany({ select: { id: true, worldOrder: true } }),
    prisma.progress.findMany({ where: { userId, completed: true }, select: { lessonId: true } }),
    prisma.skillMastery.findMany({ where: { userId }, select: { state: true } }),
    prisma.activity.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500
    }),
    prisma.note.count({ where: { userId } }),
    prisma.bookmark.count({ where: { userId } }),
    prisma.project.count({ where: { userId } })
  ]);

  const stepEvents = await prisma.xpEvent.findMany({
    where: { userId, reason: "lesson.step" },
    select: { key: true }
  });
  const passedStepIds = new Set(stepEvents.map((event) => refOfKey(event.key)));
  const passedStepKinds = new Set<string>();
  let passedCodeSteps = 0;
  let correctQuizSteps = 0;
  for (const step of lessonSteps) {
    if (!passedStepIds.has(step.id)) continue;
    passedStepKinds.add(step.kind);
    if (CODE_STEP_KINDS.has(step.kind)) passedCodeSteps += 1;
    if (step.kind === "quiz") correctQuizSteps += 1;
  }

  const acceptedProblemIds = [
    ...new Set(accepted.map((item) => item.problemId).filter((id): id is string => Boolean(id)))
  ];
  const problems = acceptedProblemIds.length
    ? await prisma.problem.findMany({
        where: { id: { in: acceptedProblemIds } },
        select: { slug: true, tags: true, difficulty: true, skillKeys: true }
      })
    : [];

  const acceptedSkills = new Set<string>();
  const acceptedTags = new Set<string>();
  const acceptedSlugs = new Set<string>();
  const acceptedDifficulties = new Set<string>();
  for (const problem of problems) {
    acceptedSlugs.add(problem.slug);
    acceptedDifficulties.add(problem.difficulty);
    for (const tag of problem.tags) acceptedTags.add(tag);
    for (const key of problem.skillKeys) acceptedSkills.add(key);
  }

  const worldOneIds = new Set(lessons.filter((lesson) => lesson.worldOrder === 1).map((lesson) => lesson.id));
  const completedLessonIds = new Set(completed.map((item) => item.lessonId));
  const worldOneCompleted = [...worldOneIds].filter((id) => completedLessonIds.has(id)).length;

  const activeDays = activities.map((item) => dayKey(item.createdAt));
  if (recentSubmission?.createdAt) activeDays.push(dayKey(recentSubmission.createdAt));

  return {
    submissionCount,
    acceptedCount: accepted.length,
    distinctAcceptedProblems: acceptedProblemIds.length,
    hintlessAccepted: accepted.filter((item) => item.problemId && item.mode === "independent" && item.hintsUsed === 0).length,
    acceptedSkills,
    acceptedTags,
    acceptedSlugs,
    acceptedDifficulties,
    passedStepKinds,
    passedCodeSteps,
    correctQuizSteps,
    completedLessons: completedLessonIds.size,
    worldOneLessons: worldOneIds.size,
    worldOneCompleted,
    masteredSkills: mastery.filter((item) => MASTERY_STATE_WORTH_COUNTING.has(item.state)).length,
    xp: user?.xp ?? 0,
    activeDays,
    notesAndBookmarks: notes + bookmarks,
    projects,
    hourOfDay: recentSubmission?.createdAt ? recentSubmission.createdAt.getHours() : null
  };
}

/**
 * Awards every achievement the user now qualifies for and returns only the
 * rows created by this call. Duplicate awards are impossible: the unique
 * constraint on (userId, achievementId) is enforced with createMany +
 * skipDuplicates, so concurrent calls are safe and idempotent.
 */
export async function checkAchievements(userId: string): Promise<EarnedAchievement[]> {
  const facts = await collectAchievementFacts(userId);
  const keys = evaluateAchievements(facts);
  if (keys.length === 0) return [];

  const definitions = await prisma.achievement.findMany({
    where: { key: { in: [...keys] } },
    select: { id: true, key: true, name: true, description: true, icon: true }
  });
  if (definitions.length === 0) return [];

  const known = await prisma.userAchievement.findMany({
    where: { userId, achievementId: { in: definitions.map((item) => item.id) } },
    select: { achievementId: true }
  });
  const owned = new Set(known.map((item) => item.achievementId));
  const fresh = definitions.filter((item) => !owned.has(item.id));
  if (fresh.length === 0) return [];

  const data: Prisma.UserAchievementCreateManyInput[] = fresh.map((item) => ({
    userId,
    achievementId: item.id
  }));
  await prisma.userAchievement.createMany({ data, skipDuplicates: true });

  const created = await prisma.userAchievement.findMany({
    where: { userId, achievementId: { in: fresh.map((item) => item.id) } },
    include: { achievement: true },
    orderBy: { earnedAt: "asc" }
  });

  return created.map((row) => ({
    id: row.achievement.id,
    key: row.achievement.key,
    name: row.achievement.name,
    description: row.achievement.description,
    icon: row.achievement.icon,
    earnedAt: row.earnedAt
  }));
}
