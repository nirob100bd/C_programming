const delegate = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn()
});

export const mockPrisma = {
  user: delegate(),
  lesson: delegate(),
  lessonStep: delegate(),
  progress: delegate(),
  progressSnapshot: delegate(),
  submission: delegate(),
  xpEvent: delegate(),
  skillMastery: delegate(),
  skill: delegate(),
  problem: delegate(),
  testCase: delegate(),
  hintEvent: delegate(),
  achievement: delegate(),
  userAchievement: delegate(),
  note: delegate(),
  bookmark: delegate(),
  activity: delegate(),
  project: delegate(),
  learningSession: delegate(),
  revisionItem: delegate(),
  referenceEntry: delegate(),
  $transaction: jest.fn(),
  $disconnect: jest.fn()
};

export function resetPrismaMock() {
  for (const value of Object.values(mockPrisma)) {
    if (typeof value === "function" && "mockReset" in value) {
      (value as jest.Mock).mockReset();
      continue;
    }
    if (value && typeof value === "object") {
      for (const method of Object.values(value)) {
        if (typeof method === "function" && "mockReset" in method) {
          (method as jest.Mock).mockReset();
        }
      }
    }
  }
  mockPrisma.$transaction.mockImplementation(async (input: unknown) => {
    if (typeof input === "function") {
      return (input as (client: typeof mockPrisma) => unknown)(mockPrisma);
    }
    if (Array.isArray(input)) return Promise.all(input);
    throw new Error("Unsupported transaction test input");
  });
}
