export function request(
  path: string,
  method = "GET",
  body?: unknown
) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

export async function responseJson<T = Record<string, unknown>>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}
