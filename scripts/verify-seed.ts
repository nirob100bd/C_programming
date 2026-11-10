/**
 * Offline curriculum verifier.
 *
 * `prisma:seed` only proves that the content arrays are syntactically valid.
 * This script proves the content is *correct*: it compiles the reference
 * implementation of every judged problem, runs it against every test case
 * (public and hidden), and does the same for every lesson code step that
 * declares an expected output. It needs GCC but no Judge0 and no database, so
 * it can run in any CI container.
 *
 *   npm run verify:content
 */
import { execFile, spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { LESSONS, PROBLEMS } from "../prisma/seed";

const run = promisify(execFile);
const TIME_LIMIT_MS = 10_000;

const normalize = (value: string) => value.replace(/\r\n/g, "\n").trimEnd();

type Failure = { label: string; detail: string };

async function compile(directory: string, name: string, source: string) {
  const sourcePath = path.join(directory, `${name}.c`);
  const binaryPath = path.join(directory, name);
  await writeFile(sourcePath, source, "utf8");
  try {
    await run("gcc", ["-std=c17", "-O2", "-Wall", "-Wextra", "-o", binaryPath, sourcePath], {
      timeout: TIME_LIMIT_MS
    });
  } catch (error) {
    const detail = error as { stderr?: string; message?: string };
    throw new Error(`compilation failed: ${detail.stderr ?? detail.message ?? "unknown error"}`);
  }
  return binaryPath;
}

/**
 * Runs one compiled program with `stdin` piped in and closed. A hung program is
 * killed at the time limit so a single infinite loop cannot stall the suite.
 */
function execute(binaryPath: string, stdin: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, [], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      action();
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(() => reject(new Error(`time limit of ${TIME_LIMIT_MS} ms exceeded`)));
    }, TIME_LIMIT_MS);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });
    child.on("error", (error) => finish(() => reject(error)));
    child.on("close", (code) => finish(() => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`exit code ${code}${stderr ? `: ${stderr.trim()}` : ""}`));
    }));

    child.stdin.end(stdin);
  });
}

async function main() {
  const failures: Failure[] = [];
  const directory = await mkdtemp(path.join(tmpdir(), "cforge-content-"));

  let lessonSteps = 0;
  let problemTests = 0;
  let compiled = 0;

  try {
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        if (step.kind !== "code" || step.solutionCode === undefined || step.expectedOutput === undefined) continue;
        lessonSteps += 1;
        const label = `lesson ${lesson.slug} step ${step.order} (${step.title})`;
        try {
          const binary = await compile(directory, `lesson-${lesson.slug}-${step.order}`, step.solutionCode);
          compiled += 1;
          const stdout = await execute(binary, step.testInput ?? "");
          const actual = normalize(stdout);
          if (actual !== normalize(step.expectedOutput)) {
            failures.push({
              label,
              detail: `expected ${JSON.stringify(step.expectedOutput)} but the reference program printed ${JSON.stringify(actual)}`
            });
          }
        } catch (error) {
          failures.push({ label, detail: (error as Error).message });
        }
      }
    }

    for (const problem of PROBLEMS) {
      const label = `problem ${problem.slug}`;
      let binary: string | null = null;
      try {
        binary = await compile(directory, `problem-${problem.slug}`, problem.referenceCode);
        compiled += 1;
      } catch (error) {
        failures.push({ label, detail: (error as Error).message });
        continue;
      }
      if (problem.tests.length === 0) {
        failures.push({ label, detail: "no test cases" });
        continue;
      }
      for (const test of problem.tests) {
        problemTests += 1;
        try {
          const stdout = await execute(binary, test.input);
          if (normalize(stdout) !== normalize(test.expected)) {
            failures.push({
              label: `${label} test ${test.order}${test.hidden ? " (hidden)" : ""}`,
              detail: `input ${JSON.stringify(test.input)} expected ${JSON.stringify(test.expected)} but got ${JSON.stringify(normalize(stdout))}`
            });
          }
        } catch (error) {
          failures.push({ label: `${label} test ${test.order}`, detail: (error as Error).message });
        }
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }

  const summary =
    `${compiled} reference programs compiled, ` +
    `${lessonSteps} lesson code steps and ${problemTests} problem tests executed with GCC.`;

  if (failures.length > 0) {
    console.error("Curriculum verification failed:\n");
    for (const failure of failures) console.error(`- ${failure.label}: ${failure.detail}`);
    console.error(`\n${summary}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Curriculum verified. ${summary}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
