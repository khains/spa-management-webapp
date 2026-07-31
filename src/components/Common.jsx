import { tagStyle } from "../utils/format";

export function Loading() {
  return (
    <div className="loading-block">
      <div className="spinner" />
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="error-banner">{message}</div>;
}

export function Tag({ tag }) {
  const style = tagStyle(tag);
  return (
    <span className="tag" style={{ background: style.bg, color: style.fg }}>
      {style.label}
    </span>
  );
}

export function TagRow({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="tag-row">
      {tags.map((t) => (
        <Tag key={t} tag={t} />
      ))}
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

// Day cham dang canh hoa the hien so buoi lieu trinh da dung / tong so buoi
export function SessionDots({ used, total }) {
  const safeTotal = Math.max(total || 0, 0);
  const dots = Array.from({ length: safeTotal }, (_, i) => i < used);
  return (
    <div className="session-dots" aria-label={`Đã dùng ${used}/${safeTotal} buổi`}>
      {dots.map((filled, i) => (
        <span key={i} className={`session-dot${filled ? " filled" : ""}`} />
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, width }) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel" style={width ? { maxWidth: width } : undefined}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
