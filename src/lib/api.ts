import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly publicMessage: string = message
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError("INVALID_JSON", 400, "Request body must be valid JSON.");
  }
  return schema.parse(raw);
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

const knownErrors: Record<string, { status: number; message: string }> = {
  UNAUTHORIZED: { status: 401, message: "Unauthorized" },
  FORBIDDEN: { status: 403, message: "Forbidden" },
  NOT_FOUND: { status: 404, message: "Not found" },
  EMAIL_TAKEN: { status: 409, message: "An account with that email already exists." },
  JUDGE0_NOT_CONFIGURED: {
    status: 503,
    message: "Code execution is unavailable because Judge0 is not configured."
  },
  JUDGE0_UNAVAILABLE: {
    status: 503,
    message: "Code execution is temporarily unavailable."
  },
  JUDGE0_TIMEOUT: {
    status: 504,
    message: "The code runner did not finish before the polling deadline."
  }
};

export function fail(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid input", issues: error.flatten() },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.publicMessage },
      { status: error.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  const known = knownErrors[code];
  if (known) {
    return NextResponse.json(
      { error: known.message },
      { status: known.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (process.env.NODE_ENV !== "test") {
    console.error("Unhandled API error", error);
  }
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500, headers: { "Cache-Control": "no-store" } }
  );
}
