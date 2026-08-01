import apiClient from "./client";

export const appointmentApi = {
  list: (params) => apiClient.get("/api/appointments", { params }).then((r) => r.data),

  availability: (technician, date) =>
    apiClient
      .get("/api/appointments/availability", { params: { technician, date } })
      .then((r) => r.data),

  create: (payload) => apiClient.post("/api/appointments", payload).then((r) => r.data),

  update: (id, payload) =>
    apiClient.put(`/api/appointments/${id}`, payload).then((r) => r.data),

  checkInById: (id) =>
    apiClient.post(`/api/appointments/${id}/checkin`).then((r) => r.data),

  checkInByCode: (code) =>
    apiClient.post("/api/appointments/checkin-by-code", { code }).then((r) => r.data),

  complete: (id, resultNote) =>
    apiClient.post(`/api/appointments/${id}/complete`, { resultNote }).then((r) => r.data),

  cancel: (id) => apiClient.post(`/api/appointments/${id}/cancel`).then((r) => r.data),

  remove: (id) => apiClient.delete(`/api/appointments/${id}`).then((r) => r.data),
};