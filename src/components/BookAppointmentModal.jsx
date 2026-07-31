import { useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import { customerApi } from "../api/customerApi";
import { customerPackageApi } from "../api/packageApi";
import { appointmentApi } from "../api/appointmentApi";
import { Modal, ErrorBanner } from "./Common";
import { todayIso } from "../utils/format";

export default function BookAppointmentModal({ customerId, onClose, onBooked }) {
  const [technicians, setTechnicians] = useState([]);
  const [customerPackages, setCustomerPackages] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null); // { _id, fullName, phone }
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);

  const [form, setForm] = useState({
    servicePackageId: "",
    technicianId: "",
    serviceName: "",
    room: "",
    date: todayIso(),
    time: "09:00",
    durationMinutes: "60",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const effectiveCustomerId = customerId || selectedCustomer?._id;

  useEffect(() => {
    authApi
      .getStaffList()
      .then((list) => setTechnicians(list.filter((s) => s.role === "technician")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!effectiveCustomerId) {
      setCustomerPackages([]);
      return;
    }
    customerPackageApi
      .list({ status: "active", customer: effectiveCustomerId })
      .then(setCustomerPackages)
      .catch(() => {});
  }, [effectiveCustomerId]);

  useEffect(() => {
    if (customerId || !customerSearch.trim()) {
      setCustomerResults([]);
      return;
    }
    const t = setTimeout(() => {
      customerApi.list({ search: customerSearch.trim() }).then(setCustomerResults).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [customerSearch, customerId]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!effectiveCustomerId) {
      setError("Vui lòng chọn khách hàng");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await appointmentApi.create({
        customerId: effectiveCustomerId,
        customerPackageId: form.servicePackageId || undefined,
        technicianId: form.technicianId || undefined,
        room: form.room || undefined,
        serviceName: form.serviceName || undefined,
        startTime: `${form.date}T${form.time}:00.000Z`,
        durationMinutes: Number(form.durationMinutes) || 60,
        note: form.note || undefined,
      });
      onBooked();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Đặt lịch hẹn" onClose={onClose} width={520}>
      <form onSubmit={handleSubmit}>
        {!customerId && (
          <div className="field">
            <label>Khách hàng *</label>
            {selectedCustomer ? (
              <div className="card" style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                <span>
                  {selectedCustomer.fullName} — {selectedCustomer.phone}
                </span>
                <button type="button" className="btn-ghost btn-sm btn" onClick={() => setSelectedCustomer(null)}>
                  Đổi
                </button>
              </div>
            ) : (
              <>
                <input
                  className="input"
                  placeholder="Tìm khách hàng theo tên/SĐT..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                {customerResults.length > 0 && (
                  <div className="card" style={{ marginTop: 6, padding: 6, maxHeight: 180, overflowY: "auto" }}>
                    {customerResults.map((c) => (
                      <div
                        key={c._id}
                        style={{ padding: "8px 10px", cursor: "pointer", borderRadius: 6 }}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerResults([]);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {c.fullName} — {c.phone}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {customerPackages.length > 0 && (
          <div className="field">
            <label>Gói liệu trình áp dụng</label>
            <select className="select" value={form.servicePackageId} onChange={(e) => update("servicePackageId", e.target.value)}>
              <option value="">Không trừ buổi (buổi lẻ)</option>
              {customerPackages.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.packageNameSnapshot} (còn {p.sessionsRemaining ?? p.sessionsTotal - p.sessionsUsed} buổi)
                </option>
              ))}
            </select>
          </div>
        )}

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
            {saving ? "Đang đặt lịch..." : "Đặt lịch hẹn"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
