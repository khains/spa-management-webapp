import { useEffect, useState } from "react";
import { paymentApi } from "../api/paymentApi";
import { customerApi } from "../api/customerApi";
import { Loading, ErrorBanner, EmptyState, Modal } from "../components/Common";
import { IconPlus } from "../components/Icons";
import PaymentModal from "../components/PaymentModal";
import { formatCurrency, formatDateTime, displayNameOf, paymentMethodLabel } from "../utils/format";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickingCustomer, setPickingCustomer] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState(null); // { _id, fullName, phone }

  function load() {
    setLoading(true);
    setError(null);
    paymentApi
      .list()
      .then(setPayments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Thanh toán</h1>
          <div className="page-subtitle">Lịch sử ghi nhận thanh toán của khách hàng</div>
        </div>
        <button className="btn btn-primary" onClick={() => setPickingCustomer(true)}>
          <IconPlus width={16} height={16} /> Ghi nhận thanh toán
        </button>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorBanner message={error} />}
      {!loading && !error && payments.length === 0 && (
        <EmptyState title="Chưa có giao dịch nào" subtitle="Bấm 'Ghi nhận thanh toán' để thêm mới" />
      )}

      {!loading && !error && payments.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Hình thức</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>{formatDateTime(p.date)}</td>
                  <td>{displayNameOf(p.customer)}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td>{paymentMethodLabel(p.method)}</td>
                  <td>{p.note || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pickingCustomer && (
        <PickCustomerModal
          onClose={() => setPickingCustomer(false)}
          onPicked={(customer) => {
            setPickingCustomer(false);
            setPayingCustomer(customer);
          }}
        />
      )}

      {payingCustomer && (
        <PaymentModal
          customerId={payingCustomer._id}
          onClose={() => setPayingCustomer(null)}
          onSaved={() => {
            setPayingCustomer(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function PickCustomerModal({ onClose, onPicked }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      customerApi.list({ search: search.trim() }).then(setResults).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <Modal title="Chọn khách hàng" onClose={onClose} width={440}>
      <input
        className="input"
        placeholder="Tìm theo tên hoặc SĐT..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div style={{ marginTop: 10, maxHeight: 320, overflowY: "auto" }}>
        {results.map((c) => (
          <div
            key={c._id}
            className="card card-clickable"
            style={{ marginBottom: 8, padding: "10px 14px" }}
            onClick={() => onPicked(c)}
          >
            {c.fullName} — {c.phone}
          </div>
        ))}
        {search.trim() && results.length === 0 && (
          <p style={{ color: "var(--color-ink-soft)", fontSize: 13.5, marginTop: 10 }}>Không tìm thấy khách hàng</p>
        )}
      </div>
    </Modal>
  );
}
