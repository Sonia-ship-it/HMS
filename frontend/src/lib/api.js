const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hms_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("hms_token", token);
  else localStorage.removeItem("hms_token");
}

export function setUser(user) {
  if (user) localStorage.setItem("hms_user", JSON.stringify(user));
  else localStorage.removeItem("hms_user");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("hms_token");
    const raw = localStorage.getItem("hms_user");
    const user = raw ? JSON.parse(raw) : null;
    return user ? { ...user, token } : null;
  } catch {
    return null;
  }
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    setToken(null);
    setUser(null);
    // Only redirect if we're not already on login/register page
    const pathname = window.location.pathname;
    if (!pathname.startsWith("/login") && !pathname.startsWith("/register")) {
      // Use a flag to prevent multiple redirects
      if (!window.__redirecting_to_login) {
        window.__redirecting_to_login = true;
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const authApi = {
  login: (username, password) =>
    api("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  me: () => api("/auth/me"),
  register: (body) => api("/auth/register", { method: "POST", body: JSON.stringify(body) }),
};
