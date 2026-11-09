const mockRequireUser = jest.fn();
const mockLog = jest.fn();
const mockAwardXp = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));
jest.mock("@/lib/auth", () => ({ requireUser: (...args: unknown[]) => mockRequireUser(...args) }));
jest.mock("@/lib/activity", () => ({ log: (...args: unknown[]) => mockLog(...args) }));
jest.mock("@/lib/xp", () => ({ awardXp: (...args: unknown[]) => mockAwardXp(...args) }));

import { POST as register } from "@/app/api/register/route";
import { GET as getMe, PATCH as patchMe } from "@/app/api/me/route";
import { GET as exportData } from "@/app/api/export/route";
import { POST as deleteAccount } from "@/app/api/delete-account/route";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";
import { request, responseJson } from "./helpers/requests";

describe("account API routes", () => {
  beforeEach(() => {
    resetPrismaMock();
    mockRequireUser.mockReset().mockResolvedValue("user-1");
    mockLog.mockReset().mockResolvedValue(undefined);
    mockAwardXp.mockReset().mockResolvedValue(undefined);
  });

  it("registers with a bcrypt hash and normalized email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "user-1", email: "new@example.com" });

    const response = await register(request("/api/register", "POST", {
      email: " NEW@Example.com ",
      password: "password123",
      name: "New Learner"
    }));
    expect(response.status).toBe(201);
    expect(await responseJson(response)).toEqual({ id: "user-1", email: "new@example.com" });
    const createData = mockPrisma.user.create.mock.calls[0][0].data;
    expect(createData.passwordHash).toMatch(/^\$2/);
    expect(createData.passwordHash).not.toBe("password123");
    expect(mockAwardXp).toHaveBeenCalledWith("user-1", 10, "account.created", "user-1");
  });

  it("rejects a duplicate registration", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });
    const response = await register(request("/api/register", "POST", {
      email: "new@example.com",
      password: "password123"
    }));
    expect(response.status).toBe(409);
  });

  it("returns only the authenticated profile", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "x@example.com", xp: 10 });
    const response = await getMe();
    expect(response.status).toBe(200);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "user-1" } }));
  });

  it("validates and updates profile preferences", async () => {
    mockPrisma.user.update.mockResolvedValue({ id: "user-1", theme: "dark", editorFont: 16 });
    const response = await patchMe(request("/api/me", "PATCH", { theme: "dark", editorFont: 16 }));
    expect(response.status).toBe(200);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "user-1" },
      data: { theme: "dark", editorFont: 16 }
    }));
  });

  it("exports every user-owned data category without a password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "x@example.com" });
    for (const model of [
      mockPrisma.progress,
      mockPrisma.progressSnapshot,
      mockPrisma.submission,
      mockPrisma.note,
      mockPrisma.bookmark,
      mockPrisma.skillMastery,
      mockPrisma.userAchievement,
      mockPrisma.activity,
      mockPrisma.project,
      mockPrisma.revisionItem,
      mockPrisma.hintEvent
    ]) model.findMany.mockResolvedValue([]);

    const response = await exportData();
    const body = await responseJson<Record<string, unknown>>(response);
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ formatVersion: 1, user: { id: "user-1" } });
    expect(JSON.stringify(body)).not.toContain("passwordHash");
  });

  it("deletes orphan-prone snapshots before the user", async () => {
    mockPrisma.progressSnapshot.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.user.delete.mockResolvedValue({ id: "user-1" });
    const response = await deleteAccount();
    expect(response.status).toBe(200);
    expect(mockPrisma.progressSnapshot.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });
});
