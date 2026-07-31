import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconUsers, IconLeaf, IconCalendar, IconBadge, IconWallet } from "./Icons";

export default function Layout() {
  const { staff, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">S</div>
          <div className="sidebar-brand-text">Homie Beauty Management</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/customers" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <IconUsers /> Khách hàng
          </NavLink>
          <NavLink to="/packages" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <IconLeaf /> Gói liệu trình
          </NavLink>
          <NavLink to="/appointments" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <IconCalendar /> Lịch hẹn
          </NavLink>
          <NavLink to="/payments" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <IconWallet /> Thanh toán
          </NavLink>
          {isAdmin && (
            <NavLink to="/staff" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
              <IconBadge /> Nhân viên
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{staff?.fullName || "Nhân viên"}</strong>
            {staff?.role === "admin" ? "Quản trị viên" : staff?.role === "receptionist" ? "Lễ tân" : "Kỹ thuật viên"}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
