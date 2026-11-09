import "@testing-library/jest-dom";

process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/cforge_test?schema=public";
process.env.NEXTAUTH_SECRET ??= "test-secret-that-is-at-least-thirty-two-characters";
process.env.NEXTAUTH_URL ??= "http://localhost:3000";
process.env.JUDGE0_URL ??= "";
process.env.JUDGE0_LANGUAGE_ID ??= "50";
