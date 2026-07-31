import { useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import { Loading, ErrorBanner, EmptyState, Modal } from "../components/Common";
import { IconPlus } from "../components/Icons";
import { roleLabel } from "../utils/format";

const ROLES = ["technician", "receptionist", "admin"];

export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    authApi
      .getStaffList()
      .then(setStaffList)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Nhân viên</h1>
          <div className="page-subtitle">Quản lý tài khoản lễ tân và kỹ thuật viên</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <IconPlus width={16} height={16} /> Tạo tài khoản
        </button>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorBanner message={error} />}
      {!loading && !error && staffList.length === 0 && <EmptyState title="Chưa có nhân viên nào" />}

      {!loading && !error && staffList.length > 0 && (
        <div className="grid grid-cards">
          {staffList.map((s) => (
            <div key={s._id} className="card">
              <strong>{s.fullName}</strong>
              <div style={{ fontSize: 13.5, color: "var(--color-ink-soft)", marginTop: 4 }}>@{s.username}</div>
              <div style={{ fontSize: 13.5, marginTop: 6 }}>{roleLabel(s.role)}</div>
              {s.phone && <div style={{ fontSize: 13.5, color: "var(--color-ink-soft)" }}>{s.phone}</div>}
              {s.workingHours && <div style={{ fontSize: 13.5, color: "var(--color-ink-soft)" }}>Giờ làm: {s.workingHours}</div>}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreateStaffModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "technician",
    phone: "",
    workingHours: "08:00-20:00",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.username.trim() || !form.password) {
      setError("Vui lòng nhập đủ họ tên, tên đăng nhập và mật khẩu");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await authApi.createStaff({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        workingHours: form.role === "technician" ? form.workingHours : undefined,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Tạo tài khoản nhân viên" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Họ và tên *</label>
          <input className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label>Tên đăng nhập *</label>
          <input className="input" value={form.username} onChange={(e) => update("username", e.target.value)} />
        </div>
        <div className="field">
          <label>Mật khẩu *</label>
          <input type="password" className="input" value={form.password} onChange={(e) => update("password", e.target.value)} />
        </div>
        <div className="field">
          <label>Vai trò</label>
          <select className="select" value={form.role} onChange={(e) => update("role", e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Số điện thoại</label>
          <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        {form.role === "technician" && (
          <div className="field">
            <label>Giờ làm việc</label>
            <input className="input" value={form.workingHours} onChange={(e) => update("workingHours", e.target.value)} />
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
