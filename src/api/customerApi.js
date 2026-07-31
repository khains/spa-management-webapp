import apiClient from "./client";

export const customerApi = {
  list: (params) => apiClient.get("/api/customers", { params }).then((r) => r.data),

  detail: (id) => apiClient.get(`/api/customers/${id}`).then((r) => r.data),

  create: (payload) => apiClient.post("/api/customers", payload).then((r) => r.data),

  update: (id, payload) =>
    apiClient.put(`/api/customers/${id}`, payload).then((r) => r.data),

  remove: (id) => apiClient.delete(`/api/customers/${id}`).then((r) => r.data),

  addNote: (id, content) =>
    apiClient.post(`/api/customers/${id}/notes`, { content }).then((r) => r.data),
};
