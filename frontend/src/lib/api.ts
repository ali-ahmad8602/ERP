const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    request<{ token: string; user: import("@/types").User }>("/api/auth/login", {
      method: "POST", body: JSON.stringify({ email, password })
    }),
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: import("@/types").User }>("/api/auth/register", {
      method: "POST", body: JSON.stringify({ name, email, password })
    }),
  me: () => request<{ user: import("@/types").User }>("/api/auth/me"),
};

// ─── Departments ──────────────────────────────────────────────────────────────
export const deptApi = {
  list: () =>
    request<{ departments: import("@/types").Department[] }>("/api/departments"),

  get: (deptId: string) =>
    request<{ department: import("@/types").Department }>(`/api/departments/${deptId}`),

  getBySlug: (slug: string) =>
    request<{ department: import("@/types").Department }>(`/api/departments/${slug}`),

  create: (data: { name: string; description?: string; icon?: string; color?: string }) =>
    request<{ department: import("@/types").Department }>("/api/departments", {
      method: "POST", body: JSON.stringify(data)
    }),

  update: (deptId: string, data: Partial<{ name: string; description: string; icon: string; color: string }>) =>
    request<{ department: import("@/types").Department }>(`/api/departments/${deptId}`, {
      method: "PATCH", body: JSON.stringify(data)
    }),

  delete: (deptId: string) =>
    request<{ message: string }>(`/api/departments/${deptId}`, { method: "DELETE" }),

  addMember: (deptId: string, userId: string, role: string) =>
    request<{ message: string }>(`/api/departments/${deptId}/members`, {
      method: "POST", body: JSON.stringify({ userId, role })
    }),

  removeMember: (deptId: string, userId: string) =>
    request<{ message: string }>(`/api/departments/${deptId}/members/${userId}`, {
      method: "DELETE"
    }),
};

// ─── Boards ───────────────────────────────────────────────────────────────────
export const boardApi = {
  list: (deptId?: string, companyBoards?: boolean) => {
    const params = new URLSearchParams();
    if (deptId) params.set("deptId", deptId);
    if (companyBoards) params.set("companyBoards", "true");
    return request<{ boards: import("@/types").Board[] }>(`/api/boards?${params}`);
  },

  get: (boardId: string) =>
    request<{ board: import("@/types").Board }>(`/api/boards/${boardId}`),

  create: (data: { name: string; description?: string; department?: string; isCompanyBoard?: boolean }) =>
    request<{ board: import("@/types").Board }>("/api/boards", {
      method: "POST", body: JSON.stringify(data)
    }),

  update: (boardId: string, data: object) =>
    request<{ board: import("@/types").Board }>(`/api/boards/${boardId}`, {
      method: "PATCH", body: JSON.stringify(data)
    }),

  delete: (boardId: string) =>
    request<{ message: string }>(`/api/boards/${boardId}`, { method: "DELETE" }),

  // Columns
  addColumn: (boardId: string, name: string, color?: string) =>
    request<{ board: import("@/types").Board }>(`/api/boards/${boardId}/columns`, {
      method: "POST", body: JSON.stringify({ name, color })
    }),

  updateColumn: (boardId: string, colId: string, data: object) =>
    request<{ board: import("@/types").Board }>(`/api/boards/${boardId}/columns/${colId}`, {
      method: "PATCH", body: JSON.stringify(data)
    }),

  deleteColumn: (boardId: string, colId: string) =>
    request<{ board: import("@/types").Board }>(`/api/boards/${boardId}/columns/${colId}`, {
      method: "DELETE"
    }),

  // Custom fields
  addField: (boardId: string, data: { name: string; type: string; options?: string[]; required?: boolean }) =>
    request<{ board: import("@/types").Board }>(`/api/boards/${boardId}/fields`, {
      method: "POST", body: JSON.stringify(data)
    }),

  updateField: (boardId: string, fieldId: string, data: object) =>
    request<{ board: import("@/types").Board }>(`/api/boards/${boardId}/fields/${fieldId}`, {
      method: "PATCH", body: JSON.stringify(data)
    }),

  deleteField: (boardId: string, fieldId: string) =>
    request<{ board: import("@/types").Board }>(`/api/boards/${boardId}/fields/${fieldId}`, {
      method: "DELETE"
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  search: (query: string) =>
    request<{ users: import("@/types").User[] }>(`/api/users?search=${encodeURIComponent(query)}`),
};

// ─── Cards ────────────────────────────────────────────────────────────────────
export const cardApi = {
  list: (boardId: string) =>
    request<{ cards: import("@/types").Card[] }>(`/api/cards?boardId=${boardId}`),

  get: (cardId: string) =>
    request<{ card: import("@/types").Card }>(`/api/cards/${cardId}`),

  create: (data: {
    title: string; board: string; column: string;
    description?: string; priority?: string; assignees?: string[];
    dueDate?: string; labels?: string[];
  }) =>
    request<{ card: import("@/types").Card }>("/api/cards", {
      method: "POST", body: JSON.stringify(data)
    }),

  update: (cardId: string, data: object) =>
    request<{ card: import("@/types").Card }>(`/api/cards/${cardId}`, {
      method: "PATCH", body: JSON.stringify(data)
    }),

  move: (cardId: string, columnId: string, order?: number) =>
    request<{ card: import("@/types").Card }>(`/api/cards/${cardId}/move`, {
      method: "PATCH", body: JSON.stringify({ columnId, order })
    }),

  comment: (cardId: string, text: string) =>
    request<{ comments: import("@/types").Comment[] }>(`/api/cards/${cardId}/comments`, {
      method: "POST", body: JSON.stringify({ text })
    }),

  approve: (cardId: string) =>
    request<{ card: import("@/types").Card }>(`/api/cards/${cardId}/approve`, { method: "POST" }),

  reject: (cardId: string, reason?: string) =>
    request<{ card: import("@/types").Card }>(`/api/cards/${cardId}/reject`, {
      method: "POST", body: JSON.stringify({ reason })
    }),

  delete: (cardId: string) =>
    request<{ message: string }>(`/api/cards/${cardId}`, { method: "DELETE" }),

  uploadAttachment: async (cardId: string, file: File): Promise<{ card: import("@/types").Card }> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const res = await fetch(`${BASE}/api/cards/${cardId}/attachments`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
  },

  deleteAttachment: (cardId: string, attachmentId: string) =>
    request<{ card: import("@/types").Card }>(`/api/cards/${cardId}/attachments/${attachmentId}`, { method: "DELETE" }),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () =>
    request<import("@/types").OrgOverview>("/api/analytics/overview"),

  departments: () =>
    request<{ departments: import("@/types").DeptStats[] }>("/api/analytics/departments"),

  activity: (limit = 50, before?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);
    return request<{ activities: import("@/types").ActivityEntry[] }>(`/api/analytics/activity?${params}`);
  },
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationApi = {
  list: (params?: { unreadOnly?: boolean; limit?: number; before?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.unreadOnly) searchParams.set("unreadOnly", "true");
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.before) searchParams.set("before", params.before);
    return request<{ notifications: import("@/types").Notification[]; unreadCount: number }>(`/api/notifications?${searchParams}`);
  },

  markRead: (id: string) =>
    request<{ notification: import("@/types").Notification }>(`/api/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    request<{ message: string }>("/api/notifications/read-all", { method: "PATCH" }),
};

// ─── Invites ─────────────────────────────────────────────────────────────────
export const inviteApi = {
  create: (data: { email: string; orgRole?: string; departments?: { department: string; role: string }[] }) =>
    request<{ invite: import("@/types").Invite; inviteUrl: string }>("/api/invites", {
      method: "POST", body: JSON.stringify(data)
    }),

  list: (status?: string) =>
    request<{ invites: import("@/types").Invite[] }>(`/api/invites${status ? `?status=${status}` : ""}`),

  revoke: (id: string) =>
    request<{ message: string }>(`/api/invites/${id}`, { method: "DELETE" }),

  validate: (token: string) =>
    request<{ valid: boolean; email?: string; orgRole?: string; departments?: { department: { _id: string; name: string; slug: string; icon: string; color: string }; role: string }[]; reason?: string }>(`/api/invites/validate/${token}`),

  accept: (token: string, data: { name: string; password: string }) =>
    request<{ token: string; user: import("@/types").User }>(`/api/invites/accept/${token}`, {
      method: "POST", body: JSON.stringify(data)
    }),
};
