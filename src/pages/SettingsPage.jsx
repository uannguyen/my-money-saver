import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTransactions } from '../hooks/useTransactions'
import { Header } from '../components/layout/Header'
import { logOut } from '../services/authService'
import { exportToExcel } from '../utils/exportExcel'
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories'
import { getMonthKey } from '../utils/dateHelpers'
import toast from 'react-hot-toast'
import './SettingsPage.css'

export function SettingsPage() {
  const { user } = useAuth()
  const [monthKey] = useState(getMonthKey(new Date()))
  const { transactions } = useTransactions(monthKey)

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error('Không có dữ liệu để xuất')
      return
    }
    try {
      exportToExcel(transactions, ALL_DEFAULT_CATEGORIES, `chi-tieu-${monthKey}`)
      toast.success('Đã xuất file Excel')
    } catch (err) {
      toast.error('Xuất file thất bại')
    }
  }

  const handleLogout = async () => {
    try {
      await logOut()
      toast.success('Đã đăng xuất')
    } catch {
      toast.error('Đăng xuất thất bại')
    }
  }

  return (
    <div className="page-container" id="settings-page">
      <Header title="Cài đặt" />

      <div className="settings-content">
        {/* Account */}
        <div className="card settings-section animate-fade-in-up">
          <h3 className="settings-section-title">Tài khoản</h3>
          <div className="settings-account">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="settings-avatar"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="settings-account-info">
              <span className="settings-account-name">
                {user?.displayName || 'Người dùng'}
              </span>
              <span className="settings-account-email">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Default Categories */}
        <div className="card settings-section animate-fade-in-up">
          <h3 className="settings-section-title">Danh mục mặc định</h3>
          <div className="settings-categories">
            <div className="settings-cat-group">
              <span className="settings-cat-group-label">Chi tiêu</span>
              <div className="settings-cat-list">
                {ALL_DEFAULT_CATEGORIES.filter((c) => c.type === 'expense').map((c) => (
                  <span key={c.id} className="settings-cat-chip">
                    {c.icon} {c.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="settings-cat-group">
              <span className="settings-cat-group-label">Thu nhập</span>
              <div className="settings-cat-list">
                {ALL_DEFAULT_CATEGORIES.filter((c) => c.type === 'income').map((c) => (
                  <span key={c.id} className="settings-cat-chip">
                    {c.icon} {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="card settings-section animate-fade-in-up">
          <h3 className="settings-section-title">Xuất dữ liệu</h3>
          <p className="settings-desc">Xuất giao dịch tháng hiện tại ra file Excel</p>
          <button className="btn btn-outline" onClick={handleExport}>
            📥 Xuất Excel
          </button>
        </div>

        {/* Logout */}
        <button className="btn btn-danger settings-logout" onClick={handleLogout}>
          Đăng xuất
        </button>

        <p className="settings-version">Chi Tiêu Cá Nhân v1.0</p>
      </div>
    </div>
  )
}
