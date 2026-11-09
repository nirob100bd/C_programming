jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));

import { logActivity } from "@/lib/activity";
import { apiFetch, ClientApiError } from "@/lib/http";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";

describe("activity logging and HTTP client", () => {
  beforeEach(() => {
    resetPrismaMock();
    jest.restoreAllMocks();
  });

  it("persists a user-scoped activity payload", async () => {
    mockPrisma.activity.create.mockResolvedValue({ id: "activity-1" });
    await logActivity("user-1", "run", { verdict: "Accepted" });
    expect(mockPrisma.activity.create).toHaveBeenCalledWith({
      data: { userId: "user-1", kind: "run", payload: { verdict: "Accepted" } }
    });
  });

  it("returns parsed successful API data", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({ value: 2 }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));
    await expect(apiFetch<{ value: number }>("/api/test")).resolves.toEqual({ value: 2 });
  });

  it("throws a typed client error", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({ error: "Nope" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    }));
    await expect(apiFetch("/api/test")).rejects.toEqual(new ClientApiError("Nope", 403));
  });
});
