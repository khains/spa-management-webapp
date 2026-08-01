import apiClient from "./client";

export const servicePackageApi = {
  list: () => apiClient.get("/api/packages").then((r) => r.data),
  create: (payload) => apiClient.post("/api/packages", payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/api/packages/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/packages/${id}`).then((r) => r.data),
};

export const customerPackageApi = {
  list: (params) =>
    apiClient.get("/api/customer-packages", { params }).then((r) => r.data),

  detail: (id) => apiClient.get(`/api/customer-packages/${id}`).then((r) => r.data),

  assign: (payload) =>
    apiClient.post("/api/customer-packages", payload).then((r) => r.data),

  renew: (id, payload) =>
    apiClient.post(`/api/customer-packages/${id}/renew`, payload).then((r) => r.data),

  update: (id, payload) =>
    apiClient.put(`/api/customer-packages/${id}`, payload).then((r) => r.data),

  remove: (id) => apiClient.delete(`/api/customer-packages/${id}`).then((r) => r.data),
};