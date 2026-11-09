const mockRequireUser = jest.fn();
const mockLog = jest.fn();
const mockAwardXp = jest.fn();
const mockRecordEvidence = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));
jest.mock("@/lib/auth", () => ({ requireUser: (...args: unknown[]) => mockRequireUser(...args) }));
jest.mock("@/lib/activity", () => ({ log: (...args: unknown[]) => mockLog(...args) }));
jest.mock("@/lib/xp", () => ({ awardXp: (...args: unknown[]) => mockAwardXp(...args) }));
jest.mock("@/lib/mastery", () => ({ recordEvidence: (...args: unknown[]) => mockRecordEvidence(...args) }));

import { GET as listLessons } from "@/app/api/lessons/route";
import { GET as getLesson } from "@/app/api/lesson/[lessonId]/route";
import { GET as getProgress, POST as saveProgress } from "@/app/api/progress/route";
import { GET as recentProgress } from "@/app/api/progress/recent/route";
import { GET as getMastery } from "@/app/api/mastery/route";
import { GET as getAchievements } from "@/app/api/achievements/route";
import { GET as getActivity } from "@/app/api/activity/route";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";
import { request, responseJson } from "./helpers/requests";

describe("learning API routes", () => {
  beforeEach(() => {
    resetPrismaMock();
    mockRequireUser.mockReset().mockResolvedValue("user-1");
    mockLog.mockReset().mockResolvedValue(undefined);
    mockAwardXp.mockReset().mockResolvedValue(undefined);
    mockRecordEvidence.mockReset().mockResolvedValue(undefined);
  });

  it("lists curriculum in world order", async () => {
    mockPrisma.lesson.findMany.mockResolvedValue([{ id: "lesson-1", title: "Start" }]);
    const response = await listLessons();
    expect(await responseJson(response)).toEqual([{ id: "lesson-1", title: "Start" }]);
    expect(mockPrisma.lesson.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: [{ worldOrder: "asc" }, { order: "asc" }]
    }));
  });

  it("loads lesson steps without selecting quiz answers", async () => {
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: "lesson-1", steps: [] });
    const response = await getLesson(request("/api/lesson/lesson-1"), { params: { lessonId: "lesson-1" } });
    expect(response.status).toBe(200);
    const select = mockPrisma.lesson.findUnique.mock.calls[0][0].include.steps.select;
    expect(select.quizAnswer).toBeUndefined();
  });

  it("autosaves progress and snapshots changed code", async () => {
    mockPrisma.lessonStep.findFirst.mockResolvedValue({
      id: "step-1",
      kind: "code",
      quizAnswer: null,
      skillKeys: ["c.io"],
      xpReward: 10
    });
    mockPrisma.progress.findUnique.mockResolvedValue({
      stepId: "old-step",
      code: "old code"
    });
    mockPrisma.progressSnapshot.create.mockResolvedValue({ id: "snapshot-1" });
    mockPrisma.progress.upsert.mockResolvedValue({
      id: "progress-1",
      stepId: "step-1",
      code: "new code",
      completed: false
    });

    const response = await saveProgress(request("/api/progress", "POST", {
      lessonId: "lesson-1",
      stepId: "step-1",
      code: "new code"
    }));
    expect(response.status).toBe(200);
    expect(mockPrisma.progressSnapshot.create).toHaveBeenCalledWith({
      data: { userId: "user-1", lessonId: "lesson-1", stepId: "old-step", code: "old code" }
    });
    expect(mockPrisma.progress.upsert).toHaveBeenCalled();
    expect(mockLog).toHaveBeenCalledWith("user-1", "progress.saved", expect.any(Object));
  });

  it("checks quiz answers on the server and awards evidence", async () => {
    mockPrisma.lessonStep.findFirst.mockResolvedValue({
      id: "step-quiz",
      kind: "quiz",
      quizAnswer: "Correct",
      skillKeys: ["ct.algorithm"],
      xpReward: 10
    });
    mockPrisma.progress.findUnique.mockResolvedValue(null);
    mockPrisma.progress.upsert.mockResolvedValue({ id: "progress-1", completed: false });

    const response = await saveProgress(request("/api/progress", "POST", {
      lessonId: "lesson-1",
      stepId: "step-quiz",
      code: "",
      answer: "Correct"
    }));
    expect(await responseJson(response)).toMatchObject({ quizCorrect: true });
    expect(mockAwardXp).toHaveBeenCalledWith("user-1", 10, "lesson.step", "step-quiz");
    expect(mockRecordEvidence).toHaveBeenCalled();
  });

  it("loads progress only for the authenticated user", async () => {
    mockPrisma.progress.findUnique.mockResolvedValue({ id: "progress-1" });
    const response = await getProgress(request("/api/progress?lessonId=lesson-1"));
    expect(response.status).toBe(200);
    expect(mockPrisma.progress.findUnique).toHaveBeenCalledWith({
      where: { userId_lessonId: { userId: "user-1", lessonId: "lesson-1" } }
    });
  });

  it("returns the exact recent lesson resume payload", async () => {
    mockPrisma.progress.findFirst.mockResolvedValue({ lessonId: "lesson-1", stepId: "step-2" });
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: "lesson-1", steps: [{ id: "step-2" }] });
    const response = await recentProgress();
    expect(await responseJson(response)).toMatchObject({
      progress: { stepId: "step-2" },
      lesson: { id: "lesson-1" }
    });
  });

  it("combines the skill catalog, evidence, and due revisions", async () => {
    mockPrisma.skill.findMany.mockResolvedValue([{ key: "c.loops", name: "Loops" }]);
    mockPrisma.skillMastery.findMany.mockResolvedValue([{ skillKey: "c.loops", score: 60 }]);
    mockPrisma.revisionItem.findMany.mockResolvedValue([{ id: "revision-1", skillKey: "c.loops" }]);
    const response = await getMastery();
    const body = await responseJson<{ skills: { mastery: { score: number } }[] }>(response);
    expect(body.skills[0].mastery.score).toBe(60);
  });

  it("marks earned achievements", async () => {
    mockPrisma.achievement.findMany.mockResolvedValue([{ id: "achievement-1", name: "First" }]);
    mockPrisma.userAchievement.findMany.mockResolvedValue([{ achievementId: "achievement-1", earnedAt: new Date("2026-11-09") }]);
    const response = await getAchievements();
    expect(await responseJson(response)).toEqual([expect.objectContaining({ earned: true })]);
  });

  it("bounds and scopes activity history", async () => {
    mockPrisma.activity.findMany.mockResolvedValue([]);
    const response = await getActivity(request("/api/activity?kind=run&take=9999"));
    expect(response.status).toBe(200);
    expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1", kind: "run" },
      orderBy: { createdAt: "desc" },
      take: 200
    });
  });
});
