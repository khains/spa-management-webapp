# Spa Management — Web App

Web app quản lý spa dùng chung backend với app Android, viết bằng **React + Vite**, gọi thẳng vào các API REST đã có sẵn ở `backend/`.

## Chạy thử (development)

```bash
cd web
npm install
cp .env.example .env
```

Mở `.env`, sửa `VITE_API_BASE_URL` trỏ đúng địa chỉ backend đang chạy (mặc định `http://localhost:5000`).

```bash
npm run dev
```

Mở trình duyệt tại địa chỉ hiện ra (mặc định `http://localhost:5173`). Đăng nhập bằng tài khoản mẫu `admin / admin123` (đã tạo sẵn nếu bạn chạy `npm run seed` ở backend).

## Build bản production

```bash
npm run build
```

Kết quả nằm ở thư mục `web/dist/` — đây là các file tĩnh (HTML/CSS/JS thuần), có thể:
- Deploy lên Vercel, Netlify, Cloudflare Pages (kéo thả thư mục `dist/` hoặc kết nối repo)
- Hoặc host tĩnh ngay trên chính server chạy backend (dùng `express.static`)
- Hoặc mở trực tiếp file `dist/index.html`... **không khuyến khích** vì cần chạy qua HTTP server để React Router hoạt động đúng

Trước khi build production, nhớ sửa `.env` trỏ sang domain backend thật (https) nếu đã deploy, không dùng `localhost` nữa.

## Cấu trúc thư mục

```
web/src/
├── api/            # Các hàm gọi API (axios), 1 file cho mỗi nhóm chức năng
├── context/         # AuthContext - quản lý trạng thái đăng nhập
├── components/      # Modal dùng chung (gán gói, đặt lịch, thanh toán, check-in QR), Layout, icon...
├── pages/           # Các trang: Login, Customers, CustomerDetail, Packages, Appointments, Payments, Staff
├── utils/format.js  # Định dạng tiền tệ, ngày giờ, nhãn hiển thị (đồng bộ với app Android)
├── App.jsx          # Định tuyến (React Router)
├── main.jsx         # Entry point
└── index.css        # Toàn bộ design token + style (không dùng framework CSS ngoài)
```

## Tính năng

Đầy đủ tương đương app Android:
- Quản lý khách hàng: tạo/sửa hồ sơ, ghi chú nội bộ, phân loại tự động (mới/đang dùng liệu trình/VIP/sắp hết buổi/sắp hết hạn)
- Quản lý gói liệu trình: tạo mẫu gói, gán gói cho khách, theo dõi tiến độ bằng biểu đồ chấm tròn
- Đặt lịch + Check-in: đặt lịch gắn với gói, check-in bằng nút bấm hoặc **quét mã QR bằng camera trình duyệt** (dùng thư viện `jsqr`, cần trình duyệt hỗ trợ `getUserMedia` và trang chạy qua HTTPS hoặc `localhost`)
- Thanh toán: ghi nhận tiền mặt/chuyển khoản/trả góp
- Quản lý nhân viên (chỉ tài khoản admin thấy mục này trên sidebar)

## Lưu ý về quét QR bằng camera

Trình duyệt chỉ cho phép truy cập camera (`getUserMedia`) trên trang chạy qua **HTTPS** hoặc **localhost**. Nếu bạn deploy web app lên server dùng `http://` (không có SSL) và truy cập từ máy khác, tính năng quét QR sẽ không hoạt động (nhưng vẫn dùng được ô "nhập mã thủ công" thay thế). Muốn dùng quét QR khi đã deploy, cần cấu hình HTTPS cho domain (ví dụ dùng Let's Encrypt, hoặc các nền tảng như Vercel/Netlify đã tự có HTTPS sẵn).

## Đăng nhập & phân quyền

Dùng chung hệ thống tài khoản JWT với app Android — nhân viên có thể dùng cùng 1 tài khoản để đăng nhập trên cả web lẫn app di động. Mục "Nhân viên" trên sidebar chỉ hiện với tài khoản có vai trò `admin`, backend cũng chặn API tương ứng nếu cố gọi bằng vai trò khác.
