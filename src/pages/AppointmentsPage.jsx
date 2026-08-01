import { useEffect, useState } from "react";
import { appointmentApi } from "../api/appointmentApi";
import { Loading, ErrorBanner, EmptyState } from "../components/Common";
import { IconPlus, IconQr } from "../components/Icons";
import BookAppointmentModal from "../components/BookAppointmentModal";
import CheckInModal from "../components/CheckInModal";
import EditAppointmentModal from "../components/EditAppointmentModal";
import { displayNameOf, formatDateTime, appointmentStatusLabel, todayIso } from "../utils/format";

function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function AppointmentsPage() {
  const [date, setDate] = useState(todayIso());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // 'book' | 'checkin' | null
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [actionError, setActionError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    appointmentApi
      .list({ date })
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function handleCheckInById(id) {
    setActionError(null);
    try {
      await appointmentApi.checkInById(id);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleCancel(appointment) {
    const isCheckedIn = appointment.status === "checked_in";
    const confirmMsg = isCheckedIn
      ? "Hủy lịch hẹn đã check-in này? Buổi đã trừ trong gói liệu trình sẽ được hoàn lại."
      : "Hủy lịch hẹn này?";
    if (!window.confirm(confirmMsg)) return;
    setActionError(null);
    try {
      await appointmentApi.cancel(appointment._id);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDelete(appointment) {
    if (!window.confirm("Xóa hẳn lịch hẹn đã hủy này? Hành động này không thể hoàn tác.")) return;
    setActionError(null);
    try {
      await appointmentApi.remove(appointment._id);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Lịch hẹn</h1>
          <div className="page-subtitle">Đặt lịch và check-in cho khách</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setModal("checkin")}>
            <IconQr width={16} height={16} /> Check-in bằng mã
          </button>
          <button className="btn btn-primary" onClick={() => setModal("book")}>
            <IconPlus width={16} height={16} /> Đặt lịch hẹn
          </button>
        </div>
      </div>

      <div className="toolbar">
        <button className="btn btn-secondary btn-sm" onClick={() => setDate((d) => addDays(d, -1))}>
          ‹ Hôm trước
        </button>
        <input type="date" className="input" style={{ width: 170 }} value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn btn-secondary btn-sm" onClick={() => setDate((d) => addDays(d, 1))}>
          Hôm sau ›
        </button>
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      {loading && <Loading />}
      {!loading && error && <ErrorBanner message={error} />}
      {!loading && !error && appointments.length === 0 && (
        <EmptyState title="Không có lịch hẹn trong ngày này" subtitle="Bấm 'Đặt lịch hẹn' để thêm mới" />
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="grid grid-cards">
          {appointments.map((a) => (
            <div key={a._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <strong>{formatDateTime(a.startTime)}</strong>
                <span
                  className="tag"
                  style={{
                    background: a.status === "booked" ? "var(--color-amber-soft)" : "var(--color-sage-soft)",
                    color: a.status === "booked" ? "var(--color-amber)" : "var(--color-sage)",
                  }}
                >
                  {appointmentStatusLabel(a.status)}
                </span>
              </div>
              <div style={{ fontSize: 13.5, marginTop: 8 }}>Khách: {displayNameOf(a.customer)}</div>
              {a.technician && <div style={{ fontSize: 13.5 }}>Kỹ thuật viên: {displayNameOf(a.technician)}</div>}
              {(a.serviceName || a.customerPackage?.packageNameSnapshot) && (
                <div style={{ fontSize: 13.5 }}>Dịch vụ: {a.serviceName || a.customerPackage?.packageNameSnapshot}</div>
              )}
              {a.room && <div style={{ fontSize: 13.5 }}>Phòng: {a.room}</div>}

              {a.status === "booked" && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => handleCheckInById(a._id)}>
                  Check-in (trừ 1 buổi)
                </button>
              )}

              {a.status === "booked" && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 10, marginLeft: 8 }}
                  onClick={() => setEditingAppointment(a)}
                >
                  Sửa
                </button>
              )}

              {(a.status === "booked" || a.status === "checked_in") && (
                <button
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: 10, marginLeft: 8 }}
                  onClick={() => handleCancel(a)}
                >
                  Hủy lịch hẹn
                </button>
              )}

              {a.status === "cancelled" && (
                <button
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: 10 }}
                  onClick={() => handleDelete(a)}
                >
                  Xóa lịch hẹn
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modal === "book" && (
        <BookAppointmentModal onClose={() => setModal(null)} onBooked={() => { setModal(null); load(); }} />
      )}
      {modal === "checkin" && <CheckInModal onClose={() => setModal(null)} onCheckedIn={load} />}
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSaved={() => {
            setEditingAppointment(null);
            load();
          }}
        />
      )}
    </div>
  );
}