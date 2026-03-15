
```
# Personal Expense Tracker — PWA

## 🎯 Project Overview
Build a mobile-first Progressive Web App (PWA) for personal expense tracking.
The app uses Google OAuth for authentication and Firebase Firestore for data storage.
Deployed on Vercel. No backend server needed — all logic runs on the client.

---

## 🛠 Tech Stack
- **Framework:** React 18 + Vite
- **Language:** JavaScript (không dùng TypeScript)
- **Styling:** Tailwind CSS
- **Auth:** Firebase Authentication (Google OAuth only)
- **Database:** Firebase Firestore
- **File Storage:** Firebase Storage (cho upload ảnh)
- **Charts:** Recharts
- **Export:** SheetJS (xlsx)
- **PWA:** vite-plugin-pwa
- **Routing:** React Router v6
- **Deployment:** Vercel

---

## 📁 Project Structure
```
expense-tracker/
├── public/
│   └── icons/               # PWA icons (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.jsx
│   │   │   └── Header.jsx
│   │   ├── transactions/
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionItem.jsx
│   │   │   └── TransactionList.jsx
│   │   ├── charts/
│   │   │   ├── MonthlyBarChart.jsx
│   │   │   └── CategoryPieChart.jsx
│   │   ├── budget/
│   │   │   └── BudgetCard.jsx
│   │   └── common/
│   │       ├── ConfirmDialog.jsx
│   │       └── ImageUploader.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── HomePage.jsx        # Danh sách giao dịch + tổng quan
│   │   ├── AddPage.jsx         # Form thêm giao dịch (FAB)
│   │   ├── StatsPage.jsx       # Thống kê + biểu đồ
│   │   ├── BudgetPage.jsx      # Quản lý ngân sách
│   │   └── SettingsPage.jsx    # Danh mục + export
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTransactions.js
│   │   └── useBudget.js
│   ├── services/
│   │   ├── firebase.js         # Firebase config & init
│   │   ├── authService.js
│   │   ├── transactionService.js
│   │   ├── budgetService.js
│   │   └── storageService.js   # Upload ảnh
│   ├── utils/
│   │   ├── formatCurrency.js   # Format VND
│   │   ├── exportExcel.js
│   │   └── dateHelpers.js
│   ├── constants/
│   │   └── categories.js       # Default categories
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── vite.config.js
└── package.json
```

---

## 🗄 Firestore Data Schema

```
users/{userId}/
  transactions/{transactionId}
    - id: string
    - type: "income" | "expense"
    - amount: number (VND, không có decimal)
    - categoryId: string
    - note: string (optional)
    - imageUrl: string (optional, Firebase Storage URL)
    - date: Timestamp
    - createdAt: Timestamp

  categories/{categoryId}
    - id: string
    - name: string
    - icon: string (emoji)
    - type: "income" | "expense" | "both"
    - isDefault: boolean

  budgets/{budgetId}
    - categoryId: string
    - amount: number
    - month: string (format: "2025-03")
    - spent: number (auto-calculated)
```

---

## 🔐 Firebase Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

---

## 📱 Pages & Features

### 1. LoginPage
- Màn hình full với logo app
- Nút "Đăng nhập với Google" duy nhất
- Redirect về HomePage sau khi login thành công

### 2. HomePage (Tab: Trang chủ)
- Header: tháng hiện tại với nút prev/next để chuyển tháng
- Summary card: Tổng thu | Tổng chi | Số dư (màu xanh/đỏ)
- Danh sách giao dịch nhóm theo ngày, mỗi ngày hiển thị subtotal
- Mỗi transaction item: icon danh mục, tên danh mục, ghi chú, số tiền
- Swipe left để xóa (hoặc nút delete khi tap)
- FAB button (+) ở góc dưới phải để thêm nhanh

### 3. AddPage / EditPage (Bottom sheet hoặc full page)
- Toggle: Thu / Chi
- Input số tiền (keypad số, format VND tự động khi nhập)
- Chọn danh mục (grid icon)
- Date picker (mặc định hôm nay)
- Textarea ghi chú
- Upload ảnh (chụp hoặc chọn từ thư viện)
- Nút Lưu

### 4. StatsPage (Tab: Thống kê)
- Bộ lọc: Tuần này / Tháng này / Tháng trước / 3 tháng
- Bar chart: Thu vs Chi theo ngày/tuần
- Pie chart: Chi tiêu theo danh mục
- Bảng top danh mục chi nhiều nhất

### 5. BudgetPage (Tab: Ngân sách)
- Danh sách budget theo tháng hiện tại
- Mỗi card: tên danh mục, progress bar (spent/limit), số tiền còn lại
- Progress bar đổi màu: xanh < 70%, vàng 70-90%, đỏ > 90%
- Nút thêm/sửa budget cho từng danh mục

### 6. SettingsPage (Tab: Cài đặt)
- Quản lý danh mục: thêm/sửa/xóa custom category
- Export dữ liệu: chọn khoảng thời gian → xuất file Excel
- Thông tin tài khoản + nút Đăng xuất

---

## 🎨 UI/UX Requirements
- **Mobile-first:** Thiết kế cho màn hình 375px-430px
- **Bottom Navigation:** 4 tab (Trang chủ, Thống kê, Ngân sách, Cài đặt)
- **Color scheme:**
  - Income: #22c55e (green-500)
  - Expense: #ef4444 (red-500)
  - Primary: #6366f1 (indigo-500)
  - Background: #f9fafb (gray-50)
- **Font:** System font (san-serif)
- **No desktop layout needed** — nhưng không được vỡ trên màn hình lớn

---

## 💰 Default Categories
```javascript
// Expense
[
  { id: 'food', name: 'Ăn uống', icon: '🍜', type: 'expense' },
  { id: 'transport', name: 'Đi lại', icon: '🛵', type: 'expense' },
  { id: 'shopping', name: 'Mua sắm', icon: '🛍️', type: 'expense' },
  { id: 'bills', name: 'Hóa đơn', icon: '💡', type: 'expense' },
  { id: 'health', name: 'Sức khỏe', icon: '🏥', type: 'expense' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎮', type: 'expense' },
  { id: 'education', name: 'Học tập', icon: '📚', type: 'expense' },
  { id: 'other_expense', name: 'Khác', icon: '📦', type: 'expense' },
]
// Income
[
  { id: 'salary', name: 'Lương', icon: '💼', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', type: 'income' },
  { id: 'bonus', name: 'Thưởng', icon: '🎁', type: 'income' },
  { id: 'other_income', name: 'Khác', icon: '💰', type: 'income' },
]
```

---

## ⚙️ PWA Config (vite-plugin-pwa)
```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Chi Tiêu Cá Nhân',
    short_name: 'ChiTiêu',
    theme_color: '#6366f1',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ]
  }
})
```

---

## 🚀 Implementation Steps — Thực hiện theo đúng thứ tự này:

### Step 1: Project Setup
1. `npm create vite@latest expense-tracker -- --template react`
2. Install dependencies:
   ```
   npm install firebase react-router-dom recharts xlsx tailwindcss 
               @tailwindcss/vite vite-plugin-pwa
   ```
3. Setup Tailwind CSS
4. Setup vite.config.js với PWA plugin

### Step 2: Firebase Setup
1. Tạo file `src/services/firebase.js` với config từ `.env`
2. Setup Firebase Auth (Google provider)
3. Setup Firestore
4. Setup Firebase Storage
5. Viết security rules

### Step 3: Auth Flow
1. `useAuth` hook (onAuthStateChanged)
2. `LoginPage` component
3. Protected route wrapper
4. App.jsx với routing

### Step 4: Core Transaction CRUD
1. `transactionService.js` (add/update/delete/query)
2. `useTransactions` hook
3. `TransactionForm` component (AddPage/EditPage)
4. `TransactionList` + `TransactionItem` component
5. `HomePage` với summary + list

### Step 5: Stats & Charts
1. Data aggregation logic trong `useTransactions`
2. `MonthlyBarChart` component
3. `CategoryPieChart` component
4. `StatsPage`

### Step 6: Budget
1. `budgetService.js`
2. `useBudget` hook
3. `BudgetCard` với progress bar
4. `BudgetPage`

### Step 7: Settings & Export
1. Category management UI
2. `exportExcel.js` với SheetJS
3. `SettingsPage`

### Step 8: Image Upload
1. `storageService.js`
2. `ImageUploader` component
3. Tích hợp vào TransactionForm

### Step 9: Polish
1. Loading states cho tất cả async operations
2. Error handling & toast notifications
3. Empty states (khi chưa có data)
4. Confirm dialog trước khi xóa
5. Format số tiền VND (1.500.000đ)

---

## ⚠️ Important Notes cho Claude Code
- Tất cả tiền tệ là **VND** — không có decimal, format với dấu chấm ngăn cách hàng nghìn
- Query Firestore luôn filter theo `userId` để đảm bảo data isolation
- Ảnh upload lên Firebase Storage path: `users/{userId}/transactions/{transactionId}`
- Khi delete transaction có ảnh, phải xóa cả file trên Storage
- `date` field dùng Firestore Timestamp, không phải JS Date string
- Tất cả Firestore queries cần index — tạo sẵn `firestore.indexes.json`
- Không dùng TypeScript
- Component nào cũng cần loading state và error state
```
