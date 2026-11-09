import { z } from "zod";
import { ApiError, fail, ok, parseBody } from "@/lib/api";
import { request, responseJson } from "./helpers/requests";

describe("API response helpers", () => {
  it("parses and validates JSON", async () => {
    const value = await parseBody(request("/", "POST", { count: 2 }), z.object({ count: z.number() }));
    expect(value).toEqual({ count: 2 });
  });

  it("rejects malformed JSON with a public 400", async () => {
    const malformed = new Request("http://localhost", { method: "POST", body: "{" });
    await expect(parseBody(malformed, z.unknown())).rejects.toMatchObject({ status: 400 });
  });

  it("serializes success and known errors", async () => {
    const success = ok({ value: 1 }, 201);
    expect(success.status).toBe(201);
    expect(await responseJson(success)).toEqual({ value: 1 });

    const unavailable = fail(new Error("JUDGE0_NOT_CONFIGURED"));
    expect(unavailable.status).toBe(503);
    expect(await responseJson<{ error: string }>(unavailable)).toEqual({
      error: "Code execution is unavailable because Judge0 is not configured."
    });
  });

  it("does not leak unknown server errors", async () => {
    const response = fail(new Error("database-password-in-error"));
    expect(response.status).toBe(500);
    expect(await responseJson(response)).toEqual({ error: "Internal server error" });
  });

  it("uses explicit API errors", async () => {
    const response = fail(new ApiError("DETAIL", 422, "Public detail"));
    expect(response.status).toBe(422);
    expect(await responseJson(response)).toEqual({ error: "Public detail" });
  });
});
