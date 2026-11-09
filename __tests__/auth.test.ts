jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));
jest.mock("next-auth", () => {
  const actual = jest.requireActual("next-auth");
  return { ...actual, __esModule: true, default: actual.default, getServerSession: jest.fn() };
});

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions, requireUser } from "@/lib/auth";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";
import { GET, POST } from "@/app/api/auth/[...nextauth]/route";

describe("credentials authentication", () => {
  beforeEach(resetPrismaMock);

  it("hashes passwords and authorizes a valid credential pair", async () => {
    const passwordHash = await bcrypt.hash("hunter22", 4);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "learner@example.com",
      name: "Learner",
      passwordHash
    });
    const provider = authOptions.providers[0] as unknown as {
      options: { authorize: (credentials: Record<string, string>, request: unknown) => Promise<unknown> };
    };

    const user = await provider.options.authorize({ email: "LEARNER@example.com", password: "hunter22" }, {});
    expect(user).toEqual({ id: "user-1", email: "learner@example.com", name: "Learner" });
    expect(passwordHash).not.toBe("hunter22");
  });

  it("rejects invalid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const provider = authOptions.providers[0] as unknown as {
      options: { authorize: (credentials: Record<string, string>, request: unknown) => Promise<unknown> };
    };
    await expect(provider.options.authorize({ email: "nobody@example.com", password: "bad" }, {})).resolves.toBeNull();
  });

  it("derives the protected user id from the server session", async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "session-user", email: "x@example.com" },
      expires: "2099-01-01"
    });
    await expect(requireUser()).resolves.toBe("session-user");
  });

  it("rejects a missing server session", async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);
    await expect(requireUser()).rejects.toThrow("UNAUTHORIZED");
  });

  it("exports both NextAuth route handlers", () => {
    expect(typeof GET).toBe("function");
    expect(typeof POST).toBe("function");
  });
});
