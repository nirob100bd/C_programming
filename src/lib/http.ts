export class ClientApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new ClientApiError(body?.error ?? `Request failed (${response.status})`, response.status);
  }
  return body as T;
}

export const fetcher = <T>(url: string) => apiFetch<T>(url);
