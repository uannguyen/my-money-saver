# My Money Saver - Personal Expense Tracker PWA

Một ứng dụng Progressive Web App (PWA) giúp bạn quản lý chi tiêu cá nhân một cách đơn giản, hiệu quả và bảo mật.

## 🚀 Tính năng chính

- **Xác thực an toàn:** Đăng nhập bằng tài khoản Google thông qua Firebase Auth.
- **Quản lý giao dịch:** Thêm, sửa, xóa các khoản thu nhập và chi tiêu.
- **Phân loại thông minh:** Hỗ trợ nhiều danh mục chi tiêu với biểu tượng trực quan.
- **Biểu đồ thống kê:** Theo dõi xu hướng chi tiêu qua biểu đồ tròn và biểu đồ cột sinh động.
- **Quản lý ngân sách:** Thiết lập hạn mức chi tiêu cho từng tháng.
- **Hỗ trợ PWA:** Cài đặt trực tiếp trên điện thoại/máy tính và sử dụng offline.
- **Xuất dữ liệu:** Hỗ trợ xuất danh sách chi tiêu ra file Excel.

## 🛠️ Công nghệ sử dụng

- **Frontend:** React 19, Vite, Tailwind CSS 4.
- **Database & Auth:** Firebase (Firestore, Authentication).
- **Charts:** Recharts.
- **PWA:** `vite-plugin-pwa`.
- **Icons:** Lucide React.

## 💻 Cài đặt và Chạy Local

### Điều kiện tiên quyết
- Node.js (phiên bản 18 trở lên).
- Tài khoản Firebase (để thiết lập cấu hình).

### Các bước thực hiện
1. **Clone repository:**
   ```bash
   git clone git@github.com:uannguyen/my-money-saver.git
   cd my-money-saver
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env` ở thư mục gốc và thêm các thông số Firebase của bạn:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```
   Truy cập `http://localhost:5173` để xem ứng dụng.

## 🌐 Deploy (Triển khai)

Ứng dụng được thiết kế để dễ dàng triển khai lên **Firebase Hosting**.

1. **Build ứng dụng:**
   ```bash
   npm run build
   ```

2. **Cài đặt Firebase CLI (nếu chưa có):**
   ```bash
   npm install -g firebase-tools
   ```

3. **Đăng nhập và khởi tạo:**
   ```bash
   firebase login
   firebase init hosting
   ```
   *Lưu ý: Chọn thư mục public là `dist`.*

4. **Deploy:**
   ```bash
   firebase deploy
   ```

## 📝 Giấy phép
Dự án này được phát triển cho mục đích cá nhân.
