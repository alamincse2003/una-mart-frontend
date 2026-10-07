// The one fetch wrapper for the NestJS API (una-mart-backend). Components
// never call fetch directly — they use lib/catalog.ts (server), lib/api-client.ts
// (storefront, browser) or lib/admin-api-client.ts (admin, browser).
//
// The browser talks to the API directly with cookies (ARCHITECTURE.md D4),
// not through a Next.js proxy: a proxy would make every shopper look like
// the same IP to the API's rate limits.

const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1").replace(/\/$/, "");

function baseUrl(): string {
  // Server components may reach the API on a private URL (API_URL).
  if (typeof window === "undefined") return (process.env.API_URL ?? PUBLIC_API_URL).replace(/\/$/, "");
  return PUBLIC_API_URL;
}

/** Errors carry the API's machine-readable code (e.g. OUT_OF_STOCK, OTP_REQUIRED). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string = "ERROR"
  ) {
    super(message);
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Server-side only: ISR seconds (catalog). Omit for no caching. */
  revalidate?: number;
}

export async function request<T>(path: string, { body, revalidate, headers, ...init }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
      ...(revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" }),
    });
  } catch {
    throw new ApiError("We can't reach UNA Mart right now. Please check your connection and try again.", 0, "NETWORK");
  }

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { message?: string; code?: string } | null;
    throw new ApiError(
      payload?.message ?? "Something went wrong. Please try again.",
      res.status,
      payload?.code ?? "ERROR"
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function queryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== false) query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}
