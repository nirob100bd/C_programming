jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));

import {
  ACHIEVEMENT_KEYS,
  currentStreak,
  dayKey,
  evaluateAchievements,
  checkAchievements,
  type AchievementFacts
} from "@/lib/xp";
import { ACHIEVEMENTS } from "../prisma/seed";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";

const emptyFacts: AchievementFacts = {
  submissionCount: 0,
  acceptedCount: 0,
  distinctAcceptedProblems: 0,
  hintlessAccepted: 0,
  acceptedSkills: new Set<string>(),
  acceptedTags: new Set<string>(),
  acceptedSlugs: new Set<string>(),
  acceptedDifficulties: new Set<string>(),
  passedStepKinds: new Set<string>(),
  passedCodeSteps: 0,
  correctQuizSteps: 0,
  completedLessons: 0,
  worldOneLessons: 0,
  worldOneCompleted: 0,
  masteredSkills: 0,
  xp: 0,
  activeDays: [],
  notesAndBookmarks: 0,
  projects: 0,
  hourOfDay: null
};

const facts = (overrides: Partial<AchievementFacts> = {}): AchievementFacts => ({
  ...emptyFacts,
  ...overrides
});

describe("achievement rules", () => {
  it("keeps the rule keys and the seeded catalog in sync", () => {
    const seeded = ACHIEVEMENTS.map(([key]) => key).sort();
    expect([...ACHIEVEMENT_KEYS].sort()).toEqual(seeded);
  });

  it("earns nothing from an empty profile", () => {
    expect(evaluateAchievements(emptyFacts)).toEqual([]);
  });

  it("awards first-program from a single run and first-accepted from a solve", () => {
    const earned = evaluateAchievements(facts({
      submissionCount: 1,
      acceptedCount: 1,
      distinctAcceptedProblems: 1,
      acceptedSkills: new Set(["algo.greedy"]),
      acceptedSlugs: new Set(["elephant"]),
      acceptedTags: new Set(["math"]),
      acceptedDifficulties: new Set(["easy"]),
      xp: 20
    }));
    expect(earned).toEqual(expect.arrayContaining([
      "first.program",
      "first.accepted",
      "elephant.master",
      "math.wizard"
    ]));
    expect(earned).not.toContain("ten.accepted");
    expect(earned).not.toContain("hard.first");
  });

  it("counts accepted submissions and distinct problems separately", () => {
    const earned = evaluateAchievements(facts({
      submissionCount: 12,
      acceptedCount: 10,
      distinctAcceptedProblems: 4,
      xp: 400
    }));
    expect(earned).toContain("ten.accepted");
    expect(earned).not.toContain("fifty.accepted");
    expect(earned).not.toContain("five.accepted");
  });

  it("maps skill evidence to domain achievements", () => {
    const earned = evaluateAchievements(facts({
      acceptedSkills: new Set([
        "c.pointers.arithmetic",
        "c.memory.malloc",
        "ds.linked_list",
        "algo.binary_search",
        "algo.dp"
      ]),
      acceptedTags: new Set(["arrays", "strings", "sorting"]),
      acceptedDifficulties: new Set(["advanced"])
    }));
    expect(earned).toEqual(expect.arrayContaining([
      "first.pointer",
      "first.dynamic_memory",
      "first.linked_list",
      "first.binary_search",
      "first.dp",
      "array.lord",
      "string.weaver",
      "sort.savant",
      "hard.first"
    ]));
  });

  it("requires a hintless independent solve for end-to-end", () => {
    expect(evaluateAchievements(facts({ acceptedCount: 3, hintlessAccepted: 0 })))
      .not.toContain("first.end_to_end");
    expect(evaluateAchievements(facts({ acceptedCount: 3, hintlessAccepted: 1 })))
      .toContain("first.end_to_end");
  });

  it("awards step-kind achievements from the XP ledger", () => {
    const earned = evaluateAchievements(facts({
      passedStepKinds: new Set(["debug", "optimize", "code"]),
      passedCodeSteps: 25
    }));
    expect(earned).toEqual(expect.arrayContaining(["first.debug", "optimal.o1", "code.25"]));
  });

  it("gates XP, mastery, and completionist milestones", () => {
    expect(evaluateAchievements(facts({ xp: 1999 }))).toContain("xp.500");
    expect(evaluateAchievements(facts({ xp: 1999 }))).not.toContain("xp.2000");
    expect(evaluateAchievements(facts({ xp: 2000 }))).toEqual(expect.arrayContaining(["xp.2000", "rank.problem_solver"]));
    expect(evaluateAchievements(facts({ masteredSkills: 10 }))).toContain("polymath");
    expect(evaluateAchievements(facts({ worldOneLessons: 6, worldOneCompleted: 5 })))
      .not.toContain("completionist.world1");
    expect(evaluateAchievements(facts({ worldOneLessons: 6, worldOneCompleted: 6 })))
      .toContain("completionist.world1");
  });

  it("tracks streaks across distinct consecutive days", () => {
    expect(currentStreak([])).toBe(0);
    expect(currentStreak(["2026-11-01"])).toBe(1);
    expect(currentStreak(["2026-11-03", "2026-11-01", "2026-11-02", "2026-11-02"])).toBe(3);
    expect(currentStreak(["2026-11-01", "2026-11-02", "2026-11-05", "2026-11-06", "2026-11-07"])).toBe(3);
    expect(evaluateAchievements(facts({ activeDays: ["2026-11-01", "2026-11-02"] })))
      .not.toContain("streak.3");
    expect(evaluateAchievements(facts({ activeDays: ["2026-11-01", "2026-11-02", "2026-11-03"] })))
      .toContain("streak.3");
  });

  it("awards time-of-day, collection, and project achievements", () => {
    expect(evaluateAchievements(facts({ hourOfDay: 2 }))).toContain("night.owl");
    expect(evaluateAchievements(facts({ hourOfDay: 2 }))).not.toContain("early.bird");
    expect(evaluateAchievements(facts({ hourOfDay: 6 }))).toContain("early.bird");
    expect(evaluateAchievements(facts({ notesAndBookmarks: 5 }))).toContain("collector.reference");
    expect(evaluateAchievements(facts({ projects: 1 }))).toContain("builder.projects");
  });

  it("formats local day keys with zero padding", () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(dayKey(new Date(2026, 10, 9))).toBe("2026-11-09");
  });
});

describe("checkAchievements", () => {
  beforeEach(() => {
    resetPrismaMock();
    mockPrisma.user.findUnique.mockResolvedValue({ xp: 0 });
    mockPrisma.submission.count.mockResolvedValue(0);
    mockPrisma.submission.findMany.mockResolvedValue([]);
    mockPrisma.submission.findFirst.mockResolvedValue(null);
    mockPrisma.lessonStep.findMany.mockResolvedValue([]);
    mockPrisma.lesson.findMany.mockResolvedValue([]);
    mockPrisma.progress.findMany.mockResolvedValue([]);
    mockPrisma.skillMastery.findMany.mockResolvedValue([]);
    mockPrisma.activity.findMany.mockResolvedValue([]);
    mockPrisma.note.count.mockResolvedValue(0);
    mockPrisma.bookmark.count.mockResolvedValue(0);
    mockPrisma.project.count.mockResolvedValue(0);
    mockPrisma.xpEvent.findMany.mockResolvedValue([]);
    mockPrisma.achievement.findMany.mockResolvedValue([]);
    mockPrisma.userAchievement.findMany.mockResolvedValue([]);
    mockPrisma.userAchievement.createMany.mockResolvedValue({ count: 0 });
  });

  it("does no writes when nothing is earned", async () => {
    await expect(checkAchievements("user-1")).resolves.toEqual([]);
    expect(mockPrisma.achievement.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.userAchievement.createMany).not.toHaveBeenCalled();
  });

  it("awards only the achievements the user does not own yet", async () => {
    mockPrisma.submission.count.mockResolvedValue(1);
    mockPrisma.submission.findMany.mockResolvedValue([
      { problemId: "problem-1", mode: "independent", hintsUsed: 0 }
    ]);
    mockPrisma.problem.findMany.mockResolvedValue([
      { slug: "elephant", tags: ["math"], difficulty: "easy", skillKeys: ["algo.greedy"] }
    ]);
    mockPrisma.achievement.findMany.mockResolvedValue([
      { id: "a-1", key: "first.program", name: "First Program", description: "Run code.", icon: "rocket" },
      { id: "a-2", key: "first.accepted", name: "First Accepted", description: "Solve one.", icon: "check" },
      { id: "a-3", key: "elephant.master", name: "Elephant Master", description: "Solve Elephant.", icon: "trophy" }
    ]);
    mockPrisma.userAchievement.findMany
      .mockResolvedValueOnce([{ achievementId: "a-1" }])
      .mockResolvedValueOnce([
        { achievementId: "a-2", earnedAt: new Date("2026-11-09T10:00:00Z"), achievement: { id: "a-2", key: "first.accepted", name: "First Accepted", description: "Solve one.", icon: "check" } }
      ]);

    const earned = await checkAchievements("user-1");
    expect(mockPrisma.userAchievement.createMany).toHaveBeenCalledWith({
      data: [
        { userId: "user-1", achievementId: "a-2" },
        { userId: "user-1", achievementId: "a-3" }
      ],
      skipDuplicates: true
    });
    expect(earned).toEqual([
      expect.objectContaining({ key: "first.accepted", name: "First Accepted" })
    ]);
  });

  it("scopes every query to the user", async () => {
    mockPrisma.submission.count.mockResolvedValue(20);
    mockPrisma.submission.findMany.mockResolvedValue([
      { problemId: "problem-1", mode: "independent", hintsUsed: 0 }
    ]);
    mockPrisma.problem.findMany.mockResolvedValue([]);
    mockPrisma.achievement.findMany.mockResolvedValue([]);

    await checkAchievements("user-9");

    expect(mockPrisma.submission.count).toHaveBeenCalledWith({ where: { userId: "user-9" } });
    expect(mockPrisma.progress.findMany).toHaveBeenCalledWith({ where: { userId: "user-9", completed: true }, select: { lessonId: true } });
    expect(mockPrisma.note.count).toHaveBeenCalledWith({ where: { userId: "user-9" } });
    expect(mockPrisma.xpEvent.findMany).toHaveBeenCalledWith({
      where: { userId: "user-9", reason: "lesson.step" },
      select: { key: true }
    });
  });
});
