export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export async function apiFetch(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  // ensure JSON requests include the content-type header when a body is provided
  const headers = new Headers(init?.headers as HeadersInit | undefined);
  const body = init?.body;
  if (body != null && !(body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return fetch(url, { ...init, headers });
}
