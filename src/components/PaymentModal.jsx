import { useEffect, useState } from "react";
import { customerPackageApi } from "../api/packageApi";
import { paymentApi } from "../api/paymentApi";
import { Modal, ErrorBanner } from "./Common";
import { paymentMethodLabel } from "../utils/format";

const METHODS = ["tien_mat", "chuyen_khoan", "tra_gop"];

export default function PaymentModal({ customerId, onClose, onSaved }) {
  const [customerPackages, setCustomerPackages] = useState([]);
  const [form, setForm] = useState({
    customerPackageId: "",
    amount: "",
    method: "tien_mat",
    note: "",
    installmentNumber: "1",
    totalInstallments: "1",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    customerPackageApi.list({ customer: customerId }).then(setCustomerPackages).catch(() => {});
  }, [customerId]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const amountValue = Number(form.amount);
    if (!amountValue || amountValue <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await paymentApi.create({
        customerId,
        customerPackageId: form.customerPackageId || undefined,
        amount: amountValue,
        method: form.method,
        note: form.note || undefined,
        installment:
          form.method === "tra_gop"
            ? {
                totalAmount: amountValue,
                installmentNumber: Number(form.installmentNumber) || 1,
                totalInstallments: Number(form.totalInstallments) || 1,
              }
            : undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Ghi nhận thanh toán" onClose={onClose} width={480}>
      <form onSubmit={handleSubmit}>
        {customerPackages.length > 0 && (
          <div className="field">
            <label>Áp dụng cho gói</label>
            <select className="select" value={form.customerPackageId} onChange={(e) => update("customerPackageId", e.target.value)}>
              <option value="">Không gắn với gói cụ thể</option>
              {customerPackages.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.packageNameSnapshot}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label>Số tiền (VNĐ) *</label>
          <input
            type="number"
            className="input"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label>Hình thức thanh toán</label>
          <select className="select" value={form.method} onChange={(e) => update("method", e.target.value)}>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {paymentMethodLabel(m)}
              </option>
            ))}
          </select>
        </div>

        {form.method === "tra_gop" && (
          <div className="form-row">
            <div className="field">
              <label>Lần trả thứ</label>
              <input
                type="number"
                className="input"
                value={form.installmentNumber}
                onChange={(e) => update("installmentNumber", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Tổng số lần trả</label>
              <input
                type="number"
                className="input"
                value={form.totalInstallments}
                onChange={(e) => update("totalInstallments", e.target.value)}
              />
            </div>
          </div>
        )}

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
            {saving ? "Đang lưu..." : "Ghi nhận thanh toán"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
