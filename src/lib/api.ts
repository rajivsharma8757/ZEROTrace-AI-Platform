// ZEROTrace AI - Centralized Full-Stack API Client

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("zerotrace_jwt_token");
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem("zerotrace_jwt_token", token);
  } else {
    localStorage.removeItem("zerotrace_jwt_token");
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `API request failed with status ${res.status}`);
    }

    return data;
  } catch (err: any) {
    // If backend is unreachable, throw or handle
    throw err;
  }
}

export const api = {
  auth: {
    login: (credentials: { email: string; password?: string }) =>
      request<{ success: boolean; token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      request<{ success: boolean; token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    logout: () =>
      request<{ success: boolean; message: string }>("/auth/logout", {
        method: "POST",
      }),
    getMe: () => request<{ success: boolean; user: any }>("/auth/me"),
    forgotPassword: (email: string) =>
      request<{ success: boolean; message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (payload: { token: string; newPassword: string; email?: string }) =>
      request<{ success: boolean; message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    googleAuth: (credential: string) =>
      request<{ success: boolean; token: string; user: any }>("/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential }),
      }),
    verifyEmail: (token: string, email?: string) =>
      request<{ success: boolean; message: string }>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token, email }),
      }),
    resendVerification: (email: string) =>
      request<{ success: boolean; message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  },

  dashboard: {
    getStats: () => request<{ success: boolean; data: any }>("/dashboard/stats"),
    getCharts: () => request<{ success: boolean; data: any }>("/dashboard/charts"),
  },

  assets: {
    getAssets: (params?: { status?: string; storageType?: string; search?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; count: number; data: any[] }>(`/assets${query ? `?${query}` : ""}`);
    },
    getAssetById: (id: string) => request<{ success: boolean; data: any }>(`/assets/${id}`),
    createAsset: (assetData: any) =>
      request<{ success: boolean; data: any }>("/assets", {
        method: "POST",
        body: JSON.stringify(assetData),
      }),
    updateAsset: (id: string, updates: any) =>
      request<{ success: boolean; data: any }>(`/assets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    analyzeAsset: (id: string) => request<{ success: boolean; analysis: any }>(`/assets/${id}/ai-analyze`, {
      method: "POST",
    }),
  },

  wipeJobs: {
    getWipeJobs: () => request<{ success: boolean; count: number; data: any[] }>("/wipe-jobs"),
    createWipeJob: (payload: { assetId: string; wipeMethod?: string }) =>
      request<{ success: boolean; data: any }>("/wipe-jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    startWipeJob: (id: string) =>
      request<{ success: boolean; data: any }>(`/wipe-jobs/${id}/start`, {
        method: "POST",
      }),
    advanceWipeJob: (id: string) =>
      request<{ success: boolean; data: any }>(`/wipe-jobs/${id}/advance`, {
        method: "POST",
      }),
  },

  verification: {
    getVerifications: () => request<{ success: boolean; count: number; data: any[] }>("/verification"),
    getVerificationById: (id: string) => request<{ success: boolean; data: any }>(`/verification/${id}`),
    submitDecision: (id: string, payload: { decision: "PASSED" | "FAILED"; notes?: string }) =>
      request<{ success: boolean; data: any }>(`/verification/${id}/decision`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  certificates: {
    getCertificates: () => request<{ success: boolean; count: number; data: any[] }>("/certificates"),
    getCertificateById: (id: string) => request<{ success: boolean; data: any }>(`/certificates/${id}`),
    generateCertificate: (verificationId: string) =>
      request<{ success: boolean; data: any }>("/certificates", {
        method: "POST",
        body: JSON.stringify({ verificationId }),
      }),
    revokeCertificate: (id: string, reason?: string) =>
      request<{ success: boolean; data: any }>(`/certificates/${id}/revoke`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    getPdfDownloadUrl: (id: string) => `${API_BASE}/certificates/${id}/pdf`,
    publicVerify: (certificateId: string) =>
      request<any>(`/certificates/${certificateId}/public`),
  },

  audit: {
    getAuditLogs: () => request<{ success: boolean; count: number; data: any[] }>("/audit-logs"),
    verifyChain: () => request<{ success: boolean; verified: boolean; status: string; message: string; totalEvents?: number }>(
      "/audit-logs/verify-chain"
    ),
  },

  recycling: {
    getStatus: () => request<{ success: boolean; approvals: any[]; eligibleAssets: any[] }>("/recycling"),
    approve: (assetId: string, reason?: string) =>
      request<{ success: boolean; data: any }>("/recycling/approve", {
        method: "POST",
        body: JSON.stringify({ assetId, reason }),
      }),
    reject: (assetId: string, reason: string) =>
      request<{ success: boolean; data: any }>("/recycling/reject", {
        method: "POST",
        body: JSON.stringify({ assetId, reason }),
      }),
  },

  reports: {
    getData: (type: string, params?: any) => {
      const query = new URLSearchParams(params).toString();
      return request<{ success: boolean; data: any[]; count: number }>(`/reports/${type}${query ? `?${query}` : ""}`);
    },
    getCsvUrl: (type: string) => `${API_BASE}/reports/${type}/export-csv`,
    getPdfUrl: (type: string) => `${API_BASE}/reports/${type}/export-pdf`,
  },

  notifications: {
    getNotifications: () => request<{ success: boolean; count: number; data: any[] }>("/notifications"),
    markAsRead: (id: string) => request<{ success: boolean; data: any }>(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => request<{ success: boolean; message: string }>("/notifications/read-all", { method: "POST" }),
  },

  search: {
    searchGlobal: (query: string) =>
      request<{ success: boolean; results: { assets: any[]; certificates: any[]; wipeJobs: any[] } }>(
        `/search?q=${encodeURIComponent(query)}`
      ),
  },

  users: {
    getUsers: (params?: { search?: string; role?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; count: number; data: any[] }>(`/users${query ? `?${query}` : ""}`);
    },
    createUser: (userData: { fullName: string; email: string; password?: string; role: string; department?: string }) =>
      request<{ success: boolean; data: any }>("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    updateUser: (id: string, updates: any) =>
      request<{ success: boolean; data: any }>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    deleteUser: (id: string) =>
      request<{ success: boolean; message: string }>(`/users/${id}`, {
        method: "DELETE",
      }),
    invite: (payload: { email: string; role: string; department?: string }) =>
      request<{ success: boolean; message: string; invitation: any }>("/users/invite", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getInvitations: () =>
      request<{ success: boolean; count: number; data: any[] }>("/users/invitations/list"),
    resendInvitation: (id: string) =>
      request<{ success: boolean; message: string }>(`/users/invitations/${id}/resend`, {
        method: "POST",
      }),
    revokeInvitation: (id: string) =>
      request<{ success: boolean; message: string }>(`/users/invitations/${id}`, {
        method: "DELETE",
      }),
    acceptInvitation: (payload: { token: string; fullName: string; password: string }) =>
      request<{ success: boolean; message: string; user: any }>("/users/accept-invitation", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  organizations: {
    getOrganizations: () => request<{ success: boolean; count: number; data: any[] }>("/organizations"),
  },
};
