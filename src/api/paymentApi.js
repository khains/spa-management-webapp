import apiClient from "./client";

export const paymentApi = {
  list: (params) => apiClient.get("/api/payments", { params }).then((r) => r.data),
  create: (payload) => apiClient.post("/api/payments", payload).then((r) => r.data),
};
