import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { customerApi } from "../api/customerApi";
import { customerPackageApi } from "../api/packageApi";
import { Loading, ErrorBanner, TagRow, SessionDots, Modal } from "../components/Common";
import AssignPackageModal from "../components/AssignPackageModal";
import BookAppointmentModal from "../components/BookAppointmentModal";
import PaymentModal from "../components/PaymentModal";
import CustomerFormModal from "../components/CustomerFormModal";
import DeleteCustomerModal from "../components/DeleteCustomerModal";
import {
  formatDate,
  formatDateTime,
  displayNameOf,
  appointmentStatusLabel,
  packageStatusLabel,
} from "../utils/format";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState(null);

  const [modal, setModal] = useState(null); // 'assign' | 'book' | 'payment' | 'edit' | 'delete' | null

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    customerApi
      .detail(id)
      .then(setCustomer)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await customerApi.addNote(id, noteText.trim());
      setNoteText("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNote(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={error} />;
  if (!customer) return null;

  return (
    <div>
      <Link to="/customers" className="back-link">
        ← Danh sách khách hàng
      </Link>

      <div className="page-header">
        <div>
          <h1>{customer.fullName}</h1>
          <div className="page-subtitle">{customer.phone}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={() => setModal("edit")}>
            Sửa
          </button>
          <button className="btn btn-danger" onClick={() => setModal("delete")}>
            Xóa
          </button>
          <button className="btn btn-secondary" onClick={() => setModal("assign")}>
            Gán gói
          </button>
          <button className="btn btn-secondary" onClick={() => setModal("book")}>
            Đặt lịch
          </button>
          <button className="btn btn-primary" onClick={() => setModal("payment")}>
            Thanh toán
          </button>
        </div>
      </div>

      <TagRow tags={customer.tags} />

      <div className="detail-grid" style={{ marginTop: 24 }}>
        <div>
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Thông tin khách hàng</h3>
            <InfoRow label="Ngày sinh" value={customer.dob ? formatDate(customer.dob) : "--"} />
            <InfoRow label="Địa chỉ" value={customer.address || "--"} />
            <InfoRow label="Nguồn khách" value={customer.source || "--"} />
            <InfoRow label="Ghi chú da liễu" value={customer.skinNotes || "--"} />
          </div>

          <h3 className="section-title">Ghi chú nội bộ</h3>
          <div className="card">
            {customer.internalNotes.length === 0 && (
              <p style={{ color: "var(--color-ink-soft)", fontSize: 13.5 }}>Chưa có ghi chú nào</p>
            )}
            {customer.internalNotes
              .slice()
              .reverse()
              .map((note) => (
                <div key={note._id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 14 }}>{note.content}</div>
                  <div style={{ fontSize: 12, color: "var(--color-ink-soft)", marginTop: 2 }}>
                    {note.staff?.fullName || ""} • {formatDateTime(note.date)}
                  </div>
                </div>
              ))}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                className="input"
                placeholder="Thêm ghi chú mới..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <button className="btn btn-secondary" onClick={handleAddNote} disabled={savingNote}>
                Lưu
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="section-title" style={{ marginTop: 0 }}>
            Gói liệu trình
          </h3>
          {customer.packages.length === 0 && (
            <div className="card">
              <p style={{ color: "var(--color-ink-soft)", fontSize: 13.5 }}>Chưa có gói liệu trình nào</p>
            </div>
          )}
          {customer.packages.map((pkg) => (
            <div key={pkg._id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <strong>{pkg.packageNameSnapshot}</strong>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12.5, color: "var(--color-ink-soft)" }}>{packageStatusLabel(pkg.status)}</span>
                  {pkg.sessionsUsed === 0 && (
                    <button className="btn btn-danger btn-sm" onClick={() => setDeletingPackage(pkg)}>
                      Xóa
                    </button>
                  )}
                </div>
              </div>
              <SessionDots used={pkg.sessionsUsed} total={pkg.sessionsTotal} />
              <div style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                Đã dùng {pkg.sessionsUsed}/{pkg.sessionsTotal} buổi • Từ {formatDate(pkg.startDate)} đến {formatDate(pkg.endDate)}
              </div>
            </div>
          ))}

          <h3 className="section-title">Lịch sử buổi hẹn</h3>
          {customer.appointments.length === 0 && (
            <div className="card">
              <p style={{ color: "var(--color-ink-soft)", fontSize: 13.5 }}>Chưa có lịch hẹn nào</p>
            </div>
          )}
          {customer.appointments.length > 0 && (
            <div className="card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Kỹ thuật viên</th>
                    <th>Dịch vụ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.appointments.map((a) => (
                    <tr key={a._id}>
                      <td>{formatDateTime(a.startTime)}</td>
                      <td>{displayNameOf(a.technician)}</td>
                      <td>{a.serviceName || a.customerPackage?.packageNameSnapshot || "--"}</td>
                      <td>{appointmentStatusLabel(a.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal === "assign" && (
        <AssignPackageModal customerId={id} onClose={() => setModal(null)} onAssigned={() => { setModal(null); load(); }} />
      )}
      {modal === "book" && (
        <BookAppointmentModal customerId={id} onClose={() => setModal(null)} onBooked={() => { setModal(null); load(); }} />
      )}
      {modal === "payment" && (
        <PaymentModal customerId={id} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
      )}
      {modal === "edit" && (
        <CustomerFormModal
          customer={customer}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
      {modal === "delete" && (
        <DeleteCustomerModal
          customer={customer}
          onClose={() => setModal(null)}
          onDeleted={() => navigate("/customers")}
        />
      )}
      {deletingPackage && (
        <DeleteCustomerPackageModal
          pkg={deletingPackage}
          onClose={() => setDeletingPackage(null)}
          onDeleted={() => {
            setDeletingPackage(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function DeleteCustomerPackageModal({ pkg, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await customerPackageApi.remove(pkg._id);
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Modal title="Xóa gói liệu trình này?" onClose={onClose}>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", marginBottom: 4 }}>
        Gói <strong>{pkg.packageNameSnapshot}</strong> chưa được sử dụng buổi nào nên có thể xóa hẳn khỏi hồ sơ khách
        hàng. Hành động này không thể hoàn tác.
      </p>

      {error && <ErrorBanner message={error} />}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Hủy
        </button>
        <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Đang xóa..." : "Xóa gói"}
        </button>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13.5 }}>
      <span style={{ color: "var(--color-ink-soft)" }}>{label}</span>
      <span style={{ textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}