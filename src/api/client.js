import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Tu dong gan token JWT (luu trong localStorage) vao moi request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("spa_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chuan hoa loi tra ve: luon co dang { message: "..." } de UI hien thi de dang,
// va tu dong dang xuat neu token het han/khong hop le (401)
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("spa_token");
      localStorage.removeItem("spa_staff");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "Đã xảy ra lỗi không xác định";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
