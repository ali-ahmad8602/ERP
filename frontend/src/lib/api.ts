const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => request<{ user: any }>("/api/auth/me"),
};

export const analyticsApi = {
  overview: () => request<any>("/api/analytics/overview"),

  departments: () =>
    request<{ departments: any[] }>("/api/analytics/departments"),

  activity: (limit = 30) =>
    request<{ activities: any[] }>(`/api/analytics/activity?limit=${limit}`),
};

export const deptApi = {
  list: () => request<{ departments: any[] }>("/api/departments"),
};
