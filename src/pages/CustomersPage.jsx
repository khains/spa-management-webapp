import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { customerApi } from "../api/customerApi";
import { Loading, ErrorBanner, TagRow, EmptyState, Modal } from "../components/Common";
import { IconSearch, IconPlus } from "../components/Icons";

const FILTER_TAGS = [
  ["moi", "Mới"],
  ["dang_dung_lieu_trinh", "Đang dùng liệu trình"],
  ["vip", "VIP"],
  ["sap_het_buoi", "Sắp hết buổi"],
  ["sap_het_han", "Sắp hết hạn"],
];

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    customerApi
      .list({ search: search || undefined, tag: tag || undefined })
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, tag]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce nho khi go tim kiem
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Khách hàng</h1>
          <div className="page-subtitle">Quản lý hồ sơ, phân loại và lịch sử khách hàng</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <IconPlus width={16} height={16} /> Thêm khách hàng
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input" style={{ position: "relative" }}>
          <IconSearch
            width={16}
            height={16}
            style={{ position: "absolute", left: 12, top: 12, color: "var(--color-ink-soft)" }}
          />
          <input
            className="input"
            style={{ paddingLeft: 34 }}
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="toolbar">
        {FILTER_TAGS.map(([value, label]) => (
          <button
            key={value}
            className={`filter-chip${tag === value ? " active" : ""}`}
            onClick={() => setTag(tag === value ? null : value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorBanner message={error} />}
      {!loading && !error && customers.length === 0 && (
        <EmptyState title="Không có khách hàng nào" subtitle="Thử đổi bộ lọc hoặc thêm khách hàng mới" />
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="grid grid-cards">
          {customers.map((c) => (
            <div key={c._id} className="card card-clickable" onClick={() => navigate(`/customers/${c._id}`)}>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>{c.fullName}</h3>
              <div style={{ color: "var(--color-ink-soft)", fontSize: 13.5, marginBottom: 10 }}>{c.phone}</div>
              <TagRow tags={c.tags} />
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateCustomerModal
          onClose={() => setShowCreate(false)}
          onCreated={(customer) => {
            setShowCreate(false);
            navigate(`/customers/${customer._id}`);
          }}
        />
      )}
    </div>
  );
}

const SOURCES = ["walk-in", "gioi_thieu", "facebook", "tiktok", "website", "khac"];

function CreateCustomerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    dob: "",
    address: "",
    skinNotes: "",
    source: "walk-in",
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
      const customer = await customerApi.create({
        ...form,
        dob: form.dob || undefined,
      });
      onCreated(customer);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Thêm khách hàng" onClose={onClose}>
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
            {saving ? "Đang lưu..." : "Lưu khách hàng"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
