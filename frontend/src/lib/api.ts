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

export const boardApi = {
  list: (deptId: string) =>
    request<{ boards: any[] }>(`/api/boards?deptId=${deptId}`),

  get: (boardId: string) =>
    request<{ board: any }>(`/api/boards/${boardId}`),
};

export const cardApi = {
  list: (boardId: string) =>
    request<{ cards: any[] }>(`/api/cards?boardId=${boardId}`),

  create: (data: { title: string; board: string; column: string }) =>
    request<{ card: any }>("/api/cards", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (cardId: string, data: Record<string, any>) =>
    request<{ card: any }>(`/api/cards/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  move: (cardId: string, columnId: string, order: number) =>
    request<{ card: any }>(`/api/cards/${cardId}/move`, {
      method: "PATCH",
      body: JSON.stringify({ columnId, order }),
    }),

  comment: (cardId: string, text: string) =>
    request<{ comments: any[] }>(`/api/cards/${cardId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  approve: (cardId: string) =>
    request<{ card: any }>(`/api/cards/${cardId}/approve`, {
      method: "POST",
    }),

  reject: (cardId: string, reason: string) =>
    request<{ card: any }>(`/api/cards/${cardId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  delete: (cardId: string) =>
    request<{ message: string }>(`/api/cards/${cardId}`, {
      method: "DELETE",
    }),
};
