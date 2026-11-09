import { env } from "@/env";

export type JudgeResult = {
  verdict: string;
  stdout: string;
  stderr: string;
  compile: string;
  timeMs: number | null;
  memoryKb: number | null;
};

type Judge0Payload = {
  status?: { id?: number; description?: string };
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | number | null;
  memory?: number | null;
};

export const STATUS: Record<number, string> = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error (SIGSEGV)",
  8: "Runtime Error (SIGXFSZ)",
  9: "Runtime Error (SIGFPE)",
  10: "Runtime Error (SIGABRT)",
  11: "Runtime Error (NZEC)",
  12: "Runtime Error (Other)",
  13: "Internal Error",
  14: "Exec Format Error"
};

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function judgeFetch(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    throw new Error("JUDGE0_UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}

function resultFromPayload(payload: Judge0Payload): JudgeResult {
  const statusId = payload.status?.id ?? 13;
  return {
    verdict: STATUS[statusId] ?? payload.status?.description ?? "Unknown",
    stdout: payload.stdout ?? "",
    stderr: payload.stderr ?? "",
    compile: payload.compile_output ?? "",
    timeMs: payload.time == null ? null : Math.round(Number(payload.time) * 1000),
    memoryKb: payload.memory ?? null
  };
}

export async function runC(
  sourceCode: string,
  stdin = "",
  timeMs = 2000,
  memoryKb = 128_000
): Promise<JudgeResult> {
  if (!env.JUDGE0_URL) throw new Error("JUDGE0_NOT_CONFIGURED");

  const baseUrl = env.JUDGE0_URL.replace(/\/$/, "");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.JUDGE0_API_KEY) headers["X-Auth-Token"] = env.JUDGE0_API_KEY;

  const created = await judgeFetch(`${baseUrl}/submissions?base64_encoded=false&wait=false`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: env.JUDGE0_LANGUAGE_ID,
      stdin,
      cpu_time_limit: Math.max(0.1, timeMs / 1000),
      memory_limit: memoryKb
    })
  });
  if (!created.ok) throw new Error("JUDGE0_UNAVAILABLE");

  const createPayload = await created.json().catch(() => null) as { token?: string } | null;
  if (!createPayload?.token) throw new Error("JUDGE0_UNAVAILABLE");

  let last: Judge0Payload | null = null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await sleep(attempt === 0 ? 150 : 400);
    const response = await judgeFetch(
      `${baseUrl}/submissions/${encodeURIComponent(createPayload.token)}?base64_encoded=false&fields=status,stdout,stderr,compile_output,time,memory`,
      { headers }
    );
    if (!response.ok) continue;
    last = await response.json() as Judge0Payload;
    if ((last.status?.id ?? 0) > 2) return resultFromPayload(last);
  }

  throw new Error(last ? "JUDGE0_TIMEOUT" : "JUDGE0_UNAVAILABLE");
}

function normalizedOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

export async function judgeAgainstTests(
  sourceCode: string,
  tests: { input: string; expected: string }[],
  timeMs: number,
  memoryKb: number
): Promise<JudgeResult> {
  let maxTime: number | null = null;
  let maxMemory: number | null = null;

  for (const test of tests) {
    const result = await runC(sourceCode, test.input, timeMs, memoryKb);
    if (result.timeMs !== null) maxTime = Math.max(maxTime ?? 0, result.timeMs);
    if (result.memoryKb !== null) maxMemory = Math.max(maxMemory ?? 0, result.memoryKb);
    if (result.verdict !== "Accepted") return result;
    if (normalizedOutput(result.stdout) !== normalizedOutput(test.expected)) {
      return { ...result, verdict: "Wrong Answer" };
    }
  }

  return {
    verdict: "Accepted",
    stdout: "",
    stderr: "",
    compile: "",
    timeMs: maxTime,
    memoryKb: maxMemory
  };
}
