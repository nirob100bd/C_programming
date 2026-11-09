import { ceildiv, cn } from "@/lib/utils";
import { boundedQueryInteger, projectFileSchema } from "@/lib/validation";

describe("utility functions", () => {
  it("merges Tailwind classes", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });

  it("computes mathematical ceiling division", () => {
    expect(ceildiv(12, 5)).toBe(3);
    expect(ceildiv(-5, 2)).toBe(-2);
    expect(() => ceildiv(1, 0)).toThrow(RangeError);
  });

  it("bounds integer query parameters", () => {
    expect(boundedQueryInteger("500", 20, 1, 100)).toBe(100);
    expect(boundedQueryInteger("bad", 20, 1, 100)).toBe(20);
    expect(boundedQueryInteger("0", 20, 1, 100)).toBe(1);
  });

  it("accepts only safe C project file names", () => {
    expect(projectFileSchema.safeParse({ name: "main.c", content: "" }).success).toBe(true);
    expect(projectFileSchema.safeParse({ name: "../secret.c", content: "" }).success).toBe(false);
    expect(projectFileSchema.safeParse({ name: "notes.txt", content: "" }).success).toBe(false);
  });
});
