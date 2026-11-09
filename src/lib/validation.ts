import { z } from "zod";

export const cuid = z.string().trim().min(1).max(64);
export const slug = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export function boundedQueryInteger(
  value: string | null,
  fallback: number,
  minimum: number,
  maximum: number
) {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

export const projectFileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-zA-Z0-9_.-]+\.(?:c|h)$/, "Files must be safe .c or .h names."),
  content: z.string().max(100_000)
});
