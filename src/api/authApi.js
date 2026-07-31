import apiClient from "./client";

export const authApi = {
  login: (username, password) =>
    apiClient.post("/api/auth/login", { username, password }).then((r) => r.data),

  me: () => apiClient.get("/api/auth/me").then((r) => r.data),

  getStaffList: () => apiClient.get("/api/auth/staff").then((r) => r.data),

  createStaff: (payload) =>
    apiClient.post("/api/auth/staff", payload).then((r) => r.data),
};
