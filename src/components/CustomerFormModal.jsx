import { useState } from "react";
import { customerApi } from "../api/customerApi";
import { ErrorBanner, Modal } from "./Common";

const SOURCES = ["walk-in", "gioi_thieu", "facebook", "tiktok", "website", "khac"];

// Dung chung cho ca tao moi va sua khach hang. Neu co prop `customer` thi la che do sua.
export default function CustomerFormModal({ customer, onClose, onSaved }) {
  const isEdit = Boolean(customer);
  const [form, setForm] = useState({
    fullName: customer?.fullName || "",
    phone: customer?.phone || "",
    dob: customer?.dob ? customer.dob.slice(0, 10) : "",
    address: customer?.address || "",
    skinNotes: customer?.skinNotes || "",
    source: customer?.source || "walk-in",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError("Vui lòng nhập họ tên và số điện thoại");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, dob: form.dob || undefined };
      const result = isEdit
        ? await customerApi.update(customer._id, payload)
        : await customerApi.create(payload);
      onSaved(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Sửa thông tin khách hàng" : "Thêm khách hàng"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Họ và tên *</label>
          <input className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label>Số điện thoại *</label>
          <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Ngày sinh</label>
            <input type="date" className="input" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
          </div>
          <div className="field">
            <label>Nguồn khách</label>
            <select className="select" value={form.source} onChange={(e) => update("source", e.target.value)}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Địa chỉ</label>
          <input className="input" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>
        <div className="field">
          <label>Ghi chú tình trạng da liễu / dị ứng</label>
          <textarea className="textarea" value={form.skinNotes} onChange={(e) => update("skinNotes", e.target.value)} />
        </div>

        {error && <ErrorBanner message={error} />}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu khách hàng"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
