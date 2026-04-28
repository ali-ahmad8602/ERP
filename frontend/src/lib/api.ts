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

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error("Network error: Unable to reach server");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }

  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON response from server");
  }
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

  get: (deptId: string) =>
    request<{ department: any }>(`/api/departments/${deptId}`),

  create: (data: { name: string; icon?: string; color?: string; description?: string }) =>
    request<{ department: any }>("/api/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addMember: (deptId: string, userId: string, role: string) =>
    request<any>(`/api/departments/${deptId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    }),

  removeMember: (deptId: string, userId: string) =>
    request<any>(`/api/departments/${deptId}/members/${userId}`, {
      method: "DELETE",
    }),
};

export const inviteApi = {
  list: () => request<{ invites: any[] }>("/api/invites"),

  create: (data: { email: string; orgRole: string; departments?: string[] }) =>
    request<{ invite: any; inviteUrl: string }>("/api/invites", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/api/invites/${id}`, {
      method: "DELETE",
    }),

  validate: (token: string) =>
    request<{ valid: boolean; email?: string; orgName?: string }>(
      `/api/invites/validate/${token}`
    ),

  accept: (token: string, data: { name: string; password: string }) =>
    request<{ token: string; user: any }>(`/api/invites/accept/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const usersApi = {
  search: (query: string) =>
    request<{ users: any[] }>(`/api/users?search=${encodeURIComponent(query)}`),
};

export const boardApi = {
  list: (deptId: string) =>
    request<{ boards: any[] }>(`/api/boards?deptId=${deptId}`),

  get: (boardId: string) =>
    request<{ board: any }>(`/api/boards/${boardId}`),

  create: (data: { name: string; department: string }) =>
    request<{ board: any }>("/api/boards", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (boardId: string, data: any) =>
    request<{ board: any }>(`/api/boards/${boardId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (boardId: string) =>
    request<{ message: string }>(`/api/boards/${boardId}`, {
      method: "DELETE",
    }),

  addColumn: (boardId: string, name: string, color?: string) =>
    request<{ board: any }>(`/api/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify({ name, color }),
    }),

  updateColumn: (boardId: string, colId: string, data: any) =>
    request<{ board: any }>(`/api/boards/${boardId}/columns/${colId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteColumn: (boardId: string, colId: string) =>
    request<{ board: any }>(`/api/boards/${boardId}/columns/${colId}`, {
      method: "DELETE",
    }),
};

export const notificationApi = {
  list: (limit = 10) =>
    request<{ notifications: any[] }>(`/api/notifications?limit=${limit}`),

  markRead: (id: string) =>
    request<any>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    request<any>("/api/notifications/read-all", {
      method: "PATCH",
    }),
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

  uploadAttachment: async (cardId: string, file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(
      `${BASE_URL}/api/cards/${cardId}/attachments`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || body.error || `Upload failed (${res.status})`);
    }
    return res.json();
  },
};
