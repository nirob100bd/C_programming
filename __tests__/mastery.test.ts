jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));

import { recordEvidence, scheduleRevision, scoreEvidence, stateForScore, type Evidence } from "@/lib/mastery";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";

const evidence = (overrides: Partial<Evidence> = {}): Evidence => ({
  kind: "code",
  correct: true,
  weight: 3,
  at: "2026-11-09T00:00:00.000Z",
  ...overrides
});

describe("mastery engine", () => {
  beforeEach(resetPrismaMock);

  it("weights independent evidence and clamps scores", () => {
    expect(scoreEvidence([evidence()])).toBe(62);
    expect(scoreEvidence([evidence({ kind: "hintless" })])).toBe(64);
    expect(scoreEvidence(Array.from({ length: 50 }, () => evidence({ weight: 5 })))).toBe(100);
  });

  it.each([
    [0, "Not assessed"],
    [24, "Learning"],
    [44, "Developing"],
    [59, "Can solve with guidance"],
    [74, "Independent"],
    [89, "Transfer capable"],
    [90, "Mastered"]
  ])("maps score %i to %s", (score, state) => {
    expect(stateForScore(score)).toBe(state);
  });

  it("stores the latest weighted evidence", async () => {
    mockPrisma.skillMastery.upsert.mockResolvedValue({ evidence: [], score: 0, state: "Learning" });
    mockPrisma.skillMastery.update.mockResolvedValue({ score: 62, state: "Independent" });

    await recordEvidence("user-1", "c.loops", evidence({ note: "problem-1" }));
    expect(mockPrisma.skillMastery.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ score: 62, state: "Independent" })
    }));
  });

  it("deduplicates the same evidence reference", async () => {
    const existing = evidence({ note: "problem-1" });
    mockPrisma.skillMastery.upsert.mockResolvedValue({ evidence: [existing], score: 62, state: "Independent" });

    await expect(recordEvidence("user-1", "c.loops", existing)).resolves.toMatchObject({ score: 62 });
    expect(mockPrisma.skillMastery.update).not.toHaveBeenCalled();
  });

  it("schedules revision one day later", async () => {
    mockPrisma.revisionItem.upsert.mockResolvedValue({ id: "revision-1" });
    const now = new Date("2026-11-09T12:00:00.000Z");
    await scheduleRevision("user-1", "c.loops", now);
    expect(mockPrisma.revisionItem.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ dueAt: new Date("2026-11-10T12:00:00.000Z") })
    }));
  });
});
