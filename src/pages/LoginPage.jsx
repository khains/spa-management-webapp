import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/Common";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/customers", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-mark">S</div>
        <h1>Homie Beauty Management</h1>
        <p>Đăng nhập để quản lý khách hàng và lịch hẹn</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 14, padding: "11px 0" }}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="hint-text">Tài khoản mẫu: admin / admin123</p>
      </div>
    </div>
  );
}
