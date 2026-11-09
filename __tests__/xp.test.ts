jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));

import { awardXp, rankFor } from "@/lib/xp";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";

describe("XP engine", () => {
  beforeEach(resetPrismaMock);

  it.each([
    [0, "Beginner"],
    [99, "Beginner"],
    [100, "C Explorer"],
    [300, "Programmer"],
    [5500, "Elite Engineer"]
  ])("maps %i XP to %s", (xp, rank) => {
    expect(rankFor(xp)).toBe(rank);
  });

  it("awards an idempotent event and updates rank", async () => {
    mockPrisma.xpEvent.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.user.update
      .mockResolvedValueOnce({ xp: 110, rank: "Beginner" })
      .mockResolvedValueOnce({ xp: 110, rank: "C Explorer" });
    mockPrisma.xpEvent.findUnique.mockResolvedValue({ id: "event-1" });

    await expect(awardXp("user-1", 20, "lesson.step", "step-1")).resolves.toEqual({ id: "event-1" });
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.user.update).toHaveBeenLastCalledWith({
      where: { id: "user-1" },
      data: { rank: "C Explorer" }
    });
  });

  it("returns the prior event without incrementing twice", async () => {
    mockPrisma.xpEvent.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.xpEvent.findUnique.mockResolvedValue({ id: "existing" });

    await expect(awardXp("user-1", 20, "problem.accepted", "p-1")).resolves.toEqual({ id: "existing" });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("ignores invalid awards", async () => {
    await expect(awardXp("user-1", 0, "reason", "ref")).resolves.toBeNull();
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
