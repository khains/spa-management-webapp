import { useEffect, useState } from "react";
import { servicePackageApi, customerPackageApi } from "../api/packageApi";
import { Modal, Loading, ErrorBanner } from "./Common";
import { formatCurrency } from "../utils/format";

export default function AssignPackageModal({ customerId, onClose, onAssigned }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    servicePackageApi
      .list()
      .then(setPackages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAssign(pkg) {
    setAssigningId(pkg._id);
    setError(null);
    try {
      await customerPackageApi.assign({ customerId, servicePackageId: pkg._id });
      onAssigned();
    } catch (err) {
      setError(err.message);
      setAssigningId(null);
    }
  }

  return (
    <Modal title="Gán gói liệu trình" onClose={onClose} width={520}>
      {loading && <Loading />}
      {error && <ErrorBanner message={error} />}
      {!loading && packages.length === 0 && (
        <p style={{ color: "var(--color-ink-soft)" }}>Chưa có mẫu gói nào, hãy tạo ở trang Gói liệu trình trước.</p>
      )}
      {!loading &&
        packages.map((pkg) => (
          <div
            key={pkg._id}
            className="card card-clickable"
            style={{ marginBottom: 10 }}
            onClick={() => !assigningId && handleAssign(pkg)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <strong>{pkg.name}</strong>
                <div style={{ fontSize: 13, color: "var(--color-ink-soft)", marginTop: 2 }}>
                  {pkg.totalSessions} buổi • {pkg.durationDays} ngày
                </div>
              </div>
              <strong>{formatCurrency(pkg.price)}</strong>
            </div>
            {assigningId === pkg._id && (
              <div style={{ fontSize: 13, color: "var(--color-primary-dark)", marginTop: 8 }}>Đang gán...</div>
            )}
          </div>
        ))}
    </Modal>
  );
}
