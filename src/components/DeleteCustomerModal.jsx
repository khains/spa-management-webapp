import { useState } from "react";
import { customerApi } from "../api/customerApi";
import { ErrorBanner, Modal } from "./Common";

export default function DeleteCustomerModal({ customer, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await customerApi.remove(customer._id);
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Modal title="Xóa khách hàng này?" onClose={onClose}>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", marginBottom: 4 }}>
        Khách hàng <strong>{customer.fullName}</strong> sẽ bị ẩn khỏi danh sách. Lịch sử gói liệu trình, buổi hẹn và
        thanh toán trước đó vẫn được lưu lại.
      </p>

      {error && <ErrorBanner message={error} />}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Hủy
        </button>
        <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Đang xóa..." : "Xóa khách hàng"}
        </button>
      </div>
    </Modal>
  );
}
