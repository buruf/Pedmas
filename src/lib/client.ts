"use client";

/** Error carrying the HTTP status so callers can branch (e.g. 402 = locked). */
export class ApiError extends Error {
  readonly status: number;
  readonly data: Record<string, unknown>;
  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/** Tiny fetch helper for client components. */
export async function api<T = unknown>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(path, {
    ...rest,
    headers: json ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new ApiError(
      data?.error ?? `Request failed (${res.status})`,
      res.status,
      (data ?? {}) as Record<string, unknown>
    );
  }
  return data;
}
