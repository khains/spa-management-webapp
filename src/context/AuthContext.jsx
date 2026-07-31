import { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(() => {
    const raw = localStorage.getItem("spa_staff");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem("spa_token", data.token);
    localStorage.setItem("spa_staff", JSON.stringify(data.staff));
    setStaff(data.staff);
    return data.staff;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("spa_token");
    localStorage.removeItem("spa_staff");
    setStaff(null);
  }, []);

  const isAuthenticated = Boolean(localStorage.getItem("spa_token"));
  const isAdmin = staff?.role === "admin";

  return (
    <AuthContext.Provider value={{ staff, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}
