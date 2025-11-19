const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || `Erreur API (${res.status})`);
  }

  return safeJson(res);
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export default apiFetch;
