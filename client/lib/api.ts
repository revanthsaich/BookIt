const RAW_API_BASE = "https://bookit-ryk3.onrender.com";
// Normalize: strip trailing slash so joins like `${API_BASE}/api/...` don't produce `//`
export const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

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
