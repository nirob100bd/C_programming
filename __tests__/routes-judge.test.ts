const mockRequireUser = jest.fn();
const mockRunC = jest.fn();
const mockJudgeAgainstTests = jest.fn();
const mockLog = jest.fn();
const mockAwardXp = jest.fn();
const mockRecordEvidence = jest.fn();
const mockScheduleRevision = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));
jest.mock("@/lib/auth", () => ({ requireUser: (...args: unknown[]) => mockRequireUser(...args) }));
jest.mock("@/lib/judge", () => ({
  runC: (...args: unknown[]) => mockRunC(...args),
  judgeAgainstTests: (...args: unknown[]) => mockJudgeAgainstTests(...args)
}));
jest.mock("@/lib/activity", () => ({ log: (...args: unknown[]) => mockLog(...args) }));
jest.mock("@/lib/xp", () => ({ awardXp: (...args: unknown[]) => mockAwardXp(...args) }));
jest.mock("@/lib/mastery", () => ({
  recordEvidence: (...args: unknown[]) => mockRecordEvidence(...args),
  scheduleRevision: (...args: unknown[]) => mockScheduleRevision(...args)
}));

import { POST as runCode } from "@/app/api/run/route";
import { GET as listSubmissions } from "@/app/api/submissions/route";
import { GET as getSubmission } from "@/app/api/submissions/[id]/route";
import { GET as listProblems } from "@/app/api/problems/route";
import { GET as getProblem } from "@/app/api/problems/[slug]/route";
import { POST as submitProblem } from "@/app/api/problems/[slug]/submit/route";
import { POST as getHint } from "@/app/api/problems/[slug]/hint/route";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";
import { request, responseJson } from "./helpers/requests";

const accepted = {
  verdict: "Accepted",
  stdout: "42\n",
  stderr: "",
  compile: "",
  timeMs: 5,
  memoryKb: 1024
};

describe("judge and arena API routes", () => {
  beforeEach(() => {
    resetPrismaMock();
    mockRequireUser.mockReset().mockResolvedValue("user-1");
    mockRunC.mockReset().mockResolvedValue(accepted);
    mockJudgeAgainstTests.mockReset().mockResolvedValue(accepted);
    mockLog.mockReset().mockResolvedValue(undefined);
    mockAwardXp.mockReset().mockResolvedValue(undefined);
    mockRecordEvidence.mockReset().mockResolvedValue(undefined);
    mockScheduleRevision.mockReset().mockResolvedValue(undefined);
  });

  it("runs C only after deriving the user from the session", async () => {
    mockPrisma.submission.create.mockResolvedValue({ id: "submission-1" });
    const response = await runCode(request("/api/run", "POST", {
      sourceCode: "int main(void) { return 0; }",
      stdin: "",
      mode: "guided"
    }));
    expect(response.status).toBe(200);
    expect(mockRunC).toHaveBeenCalled();
    expect(mockPrisma.submission.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: "user-1", verdict: "Accepted" })
    }));
  });

  it("lists only the authenticated user's submissions", async () => {
    mockPrisma.submission.findMany.mockResolvedValue([]);
    const response = await listSubmissions(request("/api/submissions?take=10"));
    expect(response.status).toBe(200);
    expect(mockPrisma.submission.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "user-1" },
      take: 10
    }));
  });

  it("scopes submission detail by id and user", async () => {
    mockPrisma.submission.findFirst.mockResolvedValue({ id: "submission-1", userId: "user-1" });
    const response = await getSubmission(request("/api/submissions/submission-1"), { params: { id: "submission-1" } });
    expect(response.status).toBe(200);
    expect(mockPrisma.submission.findFirst).toHaveBeenCalledWith({
      where: { id: "submission-1", userId: "user-1" }
    });
  });

  it("validates filters and lists safe problem summaries", async () => {
    mockPrisma.problem.findMany.mockResolvedValue([{ id: "problem-1", slug: "elephant" }]);
    const response = await listProblems(request("/api/problems?difficulty=easy&tag=greedy"));
    expect(response.status).toBe(200);
    expect(mockPrisma.problem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { difficulty: "easy", tags: { has: "greedy" } }
    }));
  });

  it("removes editorial and reference code from public problem detail", async () => {
    mockPrisma.problem.findUnique.mockResolvedValue({
      id: "problem-1",
      slug: "elephant",
      editorial: "secret editorial",
      referenceCode: "secret code",
      tests: []
    });
    const response = await getProblem(request("/api/problems/elephant"), { params: { slug: "elephant" } });
    const body = await responseJson<Record<string, unknown>>(response);
    expect(body.referenceCode).toBeUndefined();
    expect(body.editorial).toBeUndefined();
    expect(body.editorialAvailable).toBe(true);
  });

  it("judges all tests, stores the result, and records accepted evidence", async () => {
    mockPrisma.problem.findUnique.mockResolvedValue({
      id: "problem-1",
      slug: "elephant",
      tests: [{ input: "12", expected: "3" }],
      timeLimitMs: 2000,
      memoryLimitKb: 128000,
      skillKeys: ["algo.greedy"]
    });
    mockPrisma.submission.create.mockResolvedValue({ id: "submission-1" });

    const response = await submitProblem(request("/api/problems/elephant/submit", "POST", {
      sourceCode: "source",
      mode: "independent",
      hintsUsed: 0
    }), { params: { slug: "elephant" } });
    expect(response.status).toBe(200);
    expect(mockJudgeAgainstTests).toHaveBeenCalledWith("source", [{ input: "12", expected: "3" }], 2000, 128000);
    expect(mockAwardXp).toHaveBeenCalledWith("user-1", 40, "problem.accepted", "problem-1");
    expect(mockRecordEvidence).toHaveBeenCalledWith("user-1", "algo.greedy", expect.objectContaining({ correct: true, kind: "hintless" }));
  });

  it("unlocks progressive hints in order", async () => {
    mockPrisma.problem.findUnique.mockResolvedValue({
      id: "problem-1",
      editorial: "First insight. Second insight. Final derivation.",
      referenceCode: "solution"
    });
    mockPrisma.hintEvent.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.hintEvent.create.mockResolvedValue({ id: "hint-1" });

    const response = await getHint(request("/api/problems/elephant/hint", "POST", { level: 1 }), {
      params: { slug: "elephant" }
    });
    const body = await responseJson<{ level: number; content: string; final: boolean }>(response);
    expect(body).toMatchObject({ level: 1, final: false });
    expect(body.content).toContain("First insight");
    expect(mockPrisma.hintEvent.create).toHaveBeenCalledWith({
      data: { userId: "user-1", problemId: "problem-1", level: 1 }
    });
  });
});
