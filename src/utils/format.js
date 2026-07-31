export function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + " đ";
}

export function formatDate(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("vi-VN");
}

export function formatDateTime(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Lay ten hien thi an toan cho cac truong co the la string id hoac object da populate
export function displayNameOf(field) {
  if (!field) return "--";
  if (typeof field === "string") return field;
  return field.fullName || field.name || field.packageNameSnapshot || "--";
}

const TAG_STYLES = {
  moi: { label: "Khách mới", bg: "var(--color-sage-soft)", fg: "var(--color-sage)" },
  dang_dung_lieu_trinh: { label: "Đang dùng liệu trình", bg: "var(--color-sage-soft)", fg: "var(--color-sage)" },
  vip: { label: "VIP", bg: "var(--color-amber-soft)", fg: "var(--color-amber)" },
  sap_het_buoi: { label: "Sắp hết buổi", bg: "var(--color-amber-soft)", fg: "var(--color-amber)" },
  da_het_buoi: { label: "Đã hết buổi", bg: "var(--color-danger-soft)", fg: "var(--color-danger)" },
  sap_het_han: { label: "Sắp hết hạn", bg: "var(--color-amber-soft)", fg: "var(--color-amber)" },
  da_het_han: { label: "Đã hết hạn", bg: "var(--color-surface-sunken)", fg: "var(--color-ink-soft)" },
  moi_mua_goi: { label: "Mới mua gói", bg: "var(--color-primary-soft)", fg: "var(--color-primary-dark)" },
};

export function tagStyle(tag) {
  return TAG_STYLES[tag] || { label: tag, bg: "var(--color-surface-sunken)", fg: "var(--color-ink-soft)" };
}

export function appointmentStatusLabel(status) {
  const map = {
    booked: "Đã đặt lịch",
    checked_in: "Đã check-in",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    no_show: "Không đến",
  };
  return map[status] || status;
}

export function packageStatusLabel(status) {
  const map = {
    active: "Đang hoạt động",
    completed: "Đã hoàn thành",
    expired: "Đã hết hạn",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
}

export function paymentMethodLabel(method) {
  const map = { tien_mat: "Tiền mặt", chuyen_khoan: "Chuyển khoản", tra_gop: "Trả góp" };
  return map[method] || method;
}

export function roleLabel(role) {
  const map = { admin: "Quản trị viên", receptionist: "Lễ tân", technician: "Kỹ thuật viên" };
  return map[role] || role;
}
