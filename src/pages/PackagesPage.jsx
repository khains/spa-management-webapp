import { useEffect, useState } from "react";
import { servicePackageApi } from "../api/packageApi";
import { Loading, ErrorBanner, EmptyState, Modal } from "../components/Common";
import { IconPlus } from "../components/Icons";
import { formatCurrency } from "../utils/format";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deletingPackage, setDeletingPackage] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    servicePackageApi
      .list()
      .then(setPackages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Gói liệu trình</h1>
          <div className="page-subtitle">Danh mục các gói dịch vụ đang kinh doanh</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <IconPlus width={16} height={16} /> Tạo gói mới
        </button>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorBanner message={error} />}
      {!loading && !error && packages.length === 0 && (
        <EmptyState title="Chưa có gói liệu trình nào" subtitle="Tạo gói đầu tiên để bắt đầu gán cho khách hàng" />
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="grid grid-cards">
          {packages.map((pkg) => (
            <div key={pkg._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <h3 style={{ fontSize: 16, marginBottom: 6 }}>{pkg.name}</h3>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingPackage(pkg)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeletingPackage(pkg)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
              {pkg.description && (
                <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", marginBottom: 10 }}>{pkg.description}</p>
              )}
              {pkg.services?.length > 0 && (
                <div className="tag-row" style={{ marginBottom: 10 }}>
                  {pkg.services.map((s) => (
                    <span key={s} className="tag" style={{ background: "var(--color-sage-soft)", color: "var(--color-sage)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 13.5, color: "var(--color-ink-soft)" }}>
                {pkg.totalSessions} buổi • Hạn sử dụng {pkg.durationDays} ngày
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, marginTop: 8 }}>
                {formatCurrency(pkg.price)}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <PackageFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {editingPackage && (
        <PackageFormModal
          pkg={editingPackage}
          onClose={() => setEditingPackage(null)}
          onSaved={() => {
            setEditingPackage(null);
            load();
          }}
        />
      )}

      {deletingPackage && (
        <DeletePackageModal
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

function PackageFormModal({ pkg, onClose, onSaved }) {
  const isEdit = Boolean(pkg);
  const [form, setForm] = useState({
    name: pkg?.name || "",
    description: pkg?.description || "",
    servicesText: pkg?.services?.join(", ") || "",
    totalSessions: pkg?.totalSessions ?? "",
    durationDays: pkg?.durationDays ?? "",
    price: pkg?.price ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.totalSessions || !form.durationDays || !form.price) {
      setError("Vui lòng điền đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || undefined,
        services: form.servicesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        totalSessions: Number(form.totalSessions),
        durationDays: Number(form.durationDays),
        price: Number(form.price),
      };
      if (isEdit) {
        await servicePackageApi.update(pkg._id, payload);
      } else {
        await servicePackageApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Sửa gói liệu trình" : "Tạo gói liệu trình mới"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Tên gói *</label>
          <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label>Mô tả</label>
          <textarea className="textarea" value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div className="field">
          <label>Danh sách dịch vụ (cách nhau bằng dấu phẩy)</label>
          <input
            className="input"
            placeholder="Làm sạch da, Cấp ẩm, Massage mặt"
            value={form.servicesText}
            onChange={(e) => update("servicesText", e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Số buổi *</label>
            <input type="number" className="input" value={form.totalSessions} onChange={(e) => update("totalSessions", e.target.value)} />
          </div>
          <div className="field">
            <label>Thời hạn (ngày) *</label>
            <input type="number" className="input" value={form.durationDays} onChange={(e) => update("durationDays", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Giá (VNĐ) *</label>
          <input type="number" className="input" value={form.price} onChange={(e) => update("price", e.target.value)} />
        </div>

        {error && <ErrorBanner message={error} />}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo gói"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeletePackageModal({ pkg, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await servicePackageApi.remove(pkg._id);
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Modal title="Ngừng kinh doanh gói này?" onClose={onClose}>
      <p style={{ fontSize: 14, color: "var(--color-ink-soft)", marginBottom: 4 }}>
        Gói <strong>{pkg.name}</strong> sẽ không còn hiển thị trong danh mục và không thể gán mới cho khách hàng.
        Các khách hàng đã mua gói này trước đó sẽ không bị ảnh hưởng.
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
