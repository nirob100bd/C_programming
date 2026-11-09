import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional()
);

const schema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: optionalUrl,
  JUDGE0_URL: optionalUrl,
  JUDGE0_API_KEY: z.string().optional().default(""),
  JUDGE0_LANGUAGE_ID: z.coerce.number().int().positive().default(50),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

const parsed = schema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  JUDGE0_URL: process.env.JUDGE0_URL,
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
  JUDGE0_LANGUAGE_ID: process.env.JUDGE0_LANGUAGE_ID,
  NODE_ENV: process.env.NODE_ENV
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid server environment: ${details}`);
}

export const env = parsed.data;
