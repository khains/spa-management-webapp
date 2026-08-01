import { useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import { customerPackageApi } from "../api/packageApi";
import { appointmentApi } from "../api/appointmentApi";
import { Modal, ErrorBanner } from "./Common";
import { displayNameOf } from "../utils/format";

// Chuyen mot startTime ISO (dang duoc luu nhu the la UTC, xem BookAppointmentModal)
// nguoc lai thanh cap gia tri {date, time} de do vao input date/time
function splitStartTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  return { date, time };
}

// Chi dung de sua lich hen con o trang thai "booked" (chua check-in)
export default function EditAppointmentModal({ appointment, onClose, onSaved }) {
  const [technicians, setTechnicians] = useState([]);
  const [customerPackages, setCustomerPackages] = useState([]);
  const { date: initialDate, time: initialTime } = splitStartTime(appointment.startTime);

  const [form, setForm] = useState({
    customerPackageId: appointment.customerPackage?._id || appointment.customerPackage || "",
    technicianId: appointment.technician?._id || appointment.technician || "",
    serviceName: appointment.serviceName || "",
    room: appointment.room || "",
    date: initialDate,
    time: initialTime,
    durationMinutes: String(appointment.durationMinutes || 60),
    note: appointment.note || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const customerId = appointment.customer?._id || appointment.customer;

  useEffect(() => {
    authApi
      .getStaffList()
      .then((list) => setTechnicians(list.filter((s) => s.role === "technician")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!customerId) return;
    customerPackageApi
      .list({ status: "active", customer: customerId })
      .then(setCustomerPackages)
      .catch(() => {});
  }, [customerId]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await appointmentApi.update(appointment._id, {
        customerPackage: form.customerPackageId || null,
        technician: form.technicianId || null,
        room: form.room || "",
        serviceName: form.serviceName || "",
        startTime: `${form.date}T${form.time}:00.000Z`,
        durationMinutes: Number(form.durationMinutes) || 60,
        note: form.note || "",
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Sửa lịch hẹn" onClose={onClose} width={520}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Khách hàng</label>
          <div className="card" style={{ padding: "8px 12px" }}>{displayNameOf(appointment.customer)}</div>
        </div>

        <div className="field">
          <label>Gói liệu trình áp dụng</label>
          <select className="select" value={form.customerPackageId} onChange={(e) => update("customerPackageId", e.target.value)}>
            <option value="">Không trừ buổi (buổi lẻ)</option>
            {customerPackages.map((p) => (
              <option key={p._id} value={p._id}>
                {p.packageNameSnapshot} (còn {p.sessionsRemaining ?? p.sessionsTotal - p.sessionsUsed} buổi)
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Kỹ thuật viên</label>
          <select className="select" value={form.technicianId} onChange={(e) => update("technicianId", e.target.value)}>
            <option value="">Chưa chọn</option>
            {technicians.map((t) => (
              <option key={t._id} value={t._id}>
                {t.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Tên dịch vụ</label>
            <input className="input" value={form.serviceName} onChange={(e) => update("serviceName", e.target.value)} />
          </div>
          <div className="field">
            <label>Phòng</label>
            <input className="input" value={form.room} onChange={(e) => update("room", e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Ngày</label>
            <input type="date" className="input" value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>
          <div className="field">
            <label>Giờ</label>
            <input type="time" className="input" value={form.time} onChange={(e) => update("time", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Thời lượng (phút)</label>
          <input
            type="number"
            className="input"
            value={form.durationMinutes}
            onChange={(e) => update("durationMinutes", e.target.value)}
          />
        </div>

        <div className="field">
          <label>Ghi chú</label>
          <textarea className="textarea" value={form.note} onChange={(e) => update("note", e.target.value)} />
        </div>

        {error && <ErrorBanner message={error} />}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
