import { ACHIEVEMENTS, LESSONS, PROBLEMS, REFERENCE, SKILLS } from "../prisma/seed";

const skillKeys = new Set<string>(SKILLS.map(([key]) => key));
const codeKinds = new Set(["code", "debug", "build", "optimize", "trace", "project"]);
const difficulties = new Set([
  "introductory",
  "beginner",
  "easy",
  "intermediate",
  "advanced",
  "expert",
  "master"
]);

describe("curriculum seed catalog", () => {
  const slugs = [
    ...LESSONS.map((lesson) => lesson.slug),
    ...PROBLEMS.map((problem) => problem.slug),
    ...REFERENCE.map((entry) => entry.slug)
  ];

  it("keeps every stable key unique", () => {
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("covers Worlds 1 through 4 with several lessons each", () => {
    for (const worldOrder of [1, 2, 3, 4]) {
      const lessons = LESSONS.filter((lesson) => lesson.worldOrder === worldOrder);
      expect(lessons.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("orders lessons uniquely inside a world", () => {
    const seen = new Set<string>();
    for (const lesson of LESSONS) {
      const key = `${lesson.worldOrder}:${lesson.order}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it("referential prerequisites and skill keys resolve", () => {
    const lessonSlugs = new Set(LESSONS.map((lesson) => lesson.slug));
    for (const lesson of LESSONS) {
      for (const prerequisite of lesson.prerequisites) {
        expect(lessonSlugs.has(prerequisite)).toBe(true);
      }
      expect(lesson.objectives.length).toBeGreaterThan(0);
      expect(lesson.summary.length).toBeGreaterThan(10);
    }
    for (const problem of PROBLEMS) {
      for (const key of problem.skillKeys) expect(skillKeys.has(key)).toBe(true);
    }
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        for (const key of step.skillKeys ?? []) expect(skillKeys.has(key)).toBe(true);
      }
    }
  });

  it("gives every lesson sequential steps with substantive bodies", () => {
    for (const lesson of LESSONS) {
      const orders = lesson.steps.map((step) => step.order);
      expect(orders).toEqual(orders.map((_, index) => index + 1));
      expect(lesson.steps.length).toBeGreaterThanOrEqual(2);
      for (const step of lesson.steps) {
        expect(step.title.length).toBeGreaterThan(3);
        expect(step.body.length).toBeGreaterThan(30);
        expect(step.skillKeys?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it("makes every code step runnable and checkable", () => {
    const codeSteps = LESSONS.flatMap((lesson) =>
      lesson.steps.filter((step) => codeKinds.has(step.kind)).map((step) => ({ lesson: lesson.slug, step }))
    );
    expect(codeSteps.length).toBeGreaterThanOrEqual(40);
    for (const { lesson, step } of codeSteps) {
      expect({
        lesson,
        order: step.order,
        complete: Boolean(step.starterCode && step.expectedOutput && step.solutionCode),
        distinct: step.solutionCode !== step.starterCode,
        skills: (step.skillKeys?.length ?? 0) > 0
      }).toEqual({
        lesson,
        order: step.order,
        complete: true,
        distinct: true,
        skills: true
      });
      // Steps whose program reads nothing may omit testInput.
      expect(step.testInput === undefined || typeof step.testInput === "string").toBe(true);
    }
  });

  it("gives every quiz step an answer that is one of its options", () => {
    const quizzes = LESSONS.flatMap((lesson) => lesson.steps.filter((step) => step.kind === "quiz"));
    expect(quizzes.length).toBeGreaterThanOrEqual(10);
    for (const quiz of quizzes) {
      expect(quiz.quizOptions?.length).toBeGreaterThanOrEqual(2);
      expect(quiz.quizOptions).toContain(quiz.quizAnswer);
      expect(new Set(quiz.quizOptions).size).toBe(quiz.quizOptions?.length);
    }
  });

  it("ships a judged problem bank with hidden tests and references", () => {
    expect(PROBLEMS.length).toBeGreaterThanOrEqual(12);
    for (const problem of PROBLEMS) {
      expect(difficulties.has(problem.difficulty)).toBe(true);
      expect(problem.referenceCode.length).toBeGreaterThan(80);
      expect(problem.starterCode).not.toEqual(problem.referenceCode);
      expect(problem.editorial.length).toBeGreaterThan(80);
      expect(problem.examples.length).toBeGreaterThan(0);
      expect(problem.tags.every((tag) => /^[a-z0-9-]+$/.test(tag))).toBe(true);
      expect(problem.skillKeys.length).toBeGreaterThan(0);
      expect(problem.tests.length).toBeGreaterThanOrEqual(2);
      expect(problem.tests.some((test) => test.hidden)).toBe(true);
      expect(problem.tests.filter((test) => !test.hidden).length).toBeGreaterThan(0);
      const orders = problem.tests.map((test) => test.order);
      expect(new Set(orders).size).toBe(orders.length);
    }
  });

  it("spreads the problem bank across the requested topic families", () => {
    const tags = new Set(PROBLEMS.flatMap((problem) => problem.tags));
    for (const tag of ["arrays", "strings", "math"]) expect(tags.has(tag)).toBe(true);
    const levels = new Set(PROBLEMS.map((problem) => problem.difficulty));
    expect(levels.size).toBeGreaterThanOrEqual(4);
  });

  it("documents at least 30 standard library functions", () => {
    expect(REFERENCE.length).toBeGreaterThanOrEqual(30);
    for (const entry of REFERENCE) {
      expect(entry.body.length).toBeGreaterThan(60);
      expect(entry.examples.length).toBeGreaterThan(0);
      expect(entry.category.length).toBeGreaterThan(0);
    }
    const titles = new Set(REFERENCE.map((entry) => entry.title));
    for (const required of ["strcpy", "strcat", "fgets", "realloc", "qsort", "memset", "memcpy"]) {
      expect(titles.has(required)).toBe(true);
    }
  });

  it("defines achievements with unique keys and icons", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(12);
    for (const [, name, description, icon] of ACHIEVEMENTS) {
      expect(name.length).toBeGreaterThan(2);
      expect(description.length).toBeGreaterThan(10);
      expect(icon.length).toBeGreaterThan(2);
    }
  });
});
