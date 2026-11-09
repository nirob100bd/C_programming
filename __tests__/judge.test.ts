const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" }
});

async function loadJudge(url: string) {
  jest.resetModules();
  process.env.JUDGE0_URL = url;
  return import("@/lib/judge");
}

describe("Judge0 integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    process.env.JUDGE0_URL = "";
  });

  it("fails loudly when Judge0 is not configured", async () => {
    const { runC } = await loadJudge("");
    await expect(runC("int main(void) { return 0; }")).rejects.toThrow("JUDGE0_NOT_CONFIGURED");
  });

  it("creates, polls, and normalizes a real Judge0 response", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(jsonResponse({ token: "token-1" }))
      .mockResolvedValueOnce(jsonResponse({
        status: { id: 3, description: "Accepted" },
        stdout: "42\n",
        stderr: null,
        compile_output: null,
        time: "0.012",
        memory: 2048
      }));
    const { runC } = await loadJudge("http://judge0.test/");

    await expect(runC("int main(void) { return 0; }", "", 1000, 64000)).resolves.toEqual({
      verdict: "Accepted",
      stdout: "42\n",
      stderr: "",
      compile: "",
      timeMs: 12,
      memoryKb: 2048
    });
    const createBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as Record<string, unknown>;
    expect(createBody).toMatchObject({ language_id: 50, cpu_time_limit: 1, memory_limit: 64000 });
  });

  it("compares normalized output against tests", async () => {
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(jsonResponse({ token: "token-2" }))
      .mockResolvedValueOnce(jsonResponse({
        status: { id: 3 },
        stdout: "wrong\n",
        time: "0.001",
        memory: 128
      }));
    const { judgeAgainstTests } = await loadJudge("http://judge0.test");

    await expect(judgeAgainstTests("source", [{ input: "", expected: "right" }], 2000, 128000))
      .resolves.toMatchObject({ verdict: "Wrong Answer" });
  });

  it("preserves compiler verdicts", async () => {
    jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(jsonResponse({ token: "token-3" }))
      .mockResolvedValueOnce(jsonResponse({
        status: { id: 6 },
        compile_output: "error: expected ';'"
      }));
    const { judgeAgainstTests } = await loadJudge("http://judge0.test");

    await expect(judgeAgainstTests("bad", [{ input: "", expected: "" }], 2000, 128000))
      .resolves.toMatchObject({ verdict: "Compilation Error", compile: "error: expected ';'" });
  });
});
