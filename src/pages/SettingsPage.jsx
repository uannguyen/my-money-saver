import { useAuth } from '../contexts/AuthContext'
import { usePrivacy } from '../contexts/privacyContextValue'
import { useCategories } from '../hooks/useCategories'
import { Header } from '../components/layout/Header'
import { CategoryManager } from '../components/categories/CategoryManager'
import { RecurringManager } from '../components/transactions/RecurringManager'
import { logOut } from '../services/authService'
import { getAllTransactions, getTransactionsByRange } from '../services/transactionService'
import { exportToExcel } from '../utils/exportExcel'
import { resolveExportRequest } from '../utils/exportRange'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Download } from 'lucide-react'
import './SettingsPage.css'

function PrivacySettingsSection({ categories = [] }) {
  const {
    settings,
    loading,
    hasPin,
    privacyEnabled,
    setupPin,
    changePin,
    updatePrivacySettings,
  } = usePrivacy()
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [saving, setSaving] = useState(false)
  const [categorySavingId, setCategorySavingId] = useState('')
  const [localSensitiveIds, setLocalSensitiveIds] = useState(settings.sensitiveCategoryIds || [])

  const incomeCategories = categories.filter((cat) => cat.type === 'income' && cat.parentId)
  const sensitiveIds = localSensitiveIds

  useEffect(() => {
    setLocalSensitiveIds(settings.sensitiveCategoryIds || [])
  }, [settings.sensitiveCategoryIds])

  const openPinDialog = () => {
    setCurrentPin('')
    setNewPin('')
    setPinError('')
    setPinDialogOpen(true)
  }

  const closePinDialog = () => {
    if (saving) return
    setPinDialogOpen(false)
    setCurrentPin('')
    setNewPin('')
    setPinError('')
  }

  const handleSetupPin = async (e) => {
    e.preventDefault()
    setPinError('')

    if (hasPin && currentPin.length !== 6) {
      setPinError('PIN cũ cần đúng 6 số')
      return
    }

    if (newPin.length !== 6) {
      setPinError('PIN mới cần đúng 6 số')
      return
    }

    setSaving(true)
    try {
      const ok = hasPin ? await changePin(currentPin, newPin) : await setupPin(newPin)
      if (!ok) {
        setPinError('PIN cũ không đúng')
        return
      }
      closePinDialog()
      toast.success(hasPin ? 'Đã đổi PIN' : 'Đã bật bảo mật số tiền')
    } catch {
      toast.error('Không thể lưu PIN')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleEnabled = async () => {
    setSaving(true)
    try {
      await updatePrivacySettings({ enabled: !settings.enabled })
      toast.success(settings.enabled ? 'Đã tắt bảo mật' : 'Đã bật bảo mật')
    } catch {
      toast.error('Không thể cập nhật bảo mật')
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = async (categoryId) => {
    if (categorySavingId) return

    const prevIds = localSensitiveIds
    const nextIds = prevIds.includes(categoryId)
      ? prevIds.filter((id) => id !== categoryId)
      : [...prevIds, categoryId]

    setLocalSensitiveIds(nextIds)
    setCategorySavingId(categoryId)
    try {
      await updatePrivacySettings({ sensitiveCategoryIds: nextIds })
    } catch {
      setLocalSensitiveIds(prevIds)
      toast.error('Không thể lưu danh mục nhạy cảm')
    } finally {
      setCategorySavingId('')
    }
  }

  return (
    <div className="card settings-section animate-fade-in-up">
      <div className="settings-section-row">
        <div>
          <h3 className="settings-section-title">Bảo mật số tiền</h3>
          <p className="settings-desc">Ẩn lương, tổng thu, số dư và các khoản tiết kiệm sau khi mở app.</p>
        </div>
        <button
          type="button"
          className={`settings-switch ${privacyEnabled ? 'on' : ''}`}
          onClick={handleToggleEnabled}
          disabled={loading || saving}
          aria-label="Bật tắt bảo mật số tiền"
        >
          <span />
        </button>
      </div>

      <button
        type="button"
        className="btn btn-outline settings-pin-action"
        onClick={openPinDialog}
        disabled={loading || saving}
      >
        {hasPin ? 'Đổi PIN' : 'Tạo PIN'}
      </button>

      <div className="settings-sensitive-list">
        <span className="settings-cat-group-label">Danh mục thu nhập nhạy cảm</span>
        <div className="settings-sensitive-grid">
          {incomeCategories.map((cat) => (
            <label key={cat.id} className="settings-sensitive-option">
              <input
                type="checkbox"
                checked={sensitiveIds.includes(cat.id)}
                disabled={categorySavingId === cat.id}
                onChange={() => toggleCategory(cat.id)}
              />
              <span>{cat.icon} {cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {pinDialogOpen && (
        <div className="overlay" onClick={closePinDialog}>
          <form className="dialog settings-pin-dialog" onSubmit={handleSetupPin} onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">{hasPin ? 'Đổi PIN' : 'Tạo PIN'}</h3>
            <p className="dialog-message">
              {hasPin ? 'Nhập PIN cũ để xác nhận trước khi đặt PIN mới.' : 'Tạo PIN 6 số để bảo vệ số tiền nhạy cảm.'}
            </p>

            <div className="settings-pin-dialog-fields">
              {hasPin && (
                <input
                  className="settings-pin-dialog-input"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="PIN cũ"
                  aria-label="PIN cũ"
                  autoFocus
                />
              )}
              <input
                className="settings-pin-dialog-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={hasPin ? 'PIN mới' : 'PIN mới'}
                aria-label={hasPin ? 'PIN mới' : 'PIN bảo mật số tiền'}
                autoFocus={!hasPin}
              />
            </div>

            {pinError && <div className="settings-pin-error">{pinError}</div>}

            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={closePinDialog} disabled={saving}>
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || newPin.length !== 6 || (hasPin && currentPin.length !== 6)}
              >
                {hasPin ? 'Đổi PIN' : 'Tạo PIN'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export function SettingsPage() {
  const { user } = useAuth()
  const { privacyEnabled, isUnlocked, requestUnlock } = usePrivacy()
  const { categories, loading: categoriesLoading } = useCategories()
  const [exportMode, setExportMode] = useState('all')
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')
  const [exporting, setExporting] = useState(false)

  const selectExportMode = (mode) => {
    setExportMode(mode)
    if (mode === 'all') {
      setExportStartDate('')
      setExportEndDate('')
    }
  }

  const handleExport = async () => {
    if (privacyEnabled && !isUnlocked) {
      requestUnlock()
      toast.error('Mở khóa trước khi xuất dữ liệu')
      return
    }

    if (!user?.uid) {
      toast.error('Không thể xác định tài khoản')
      return
    }

    let exportRequest
    try {
      exportRequest = resolveExportRequest({
        mode: exportMode,
        startDate: exportStartDate,
        endDate: exportEndDate,
      })
    } catch (error) {
      toast.error(error.message)
      return
    }

    setExporting(true)
    try {
      const data = exportRequest.mode === 'all'
        ? await getAllTransactions(user.uid)
        : await getTransactionsByRange(user.uid, exportRequest.startDate, exportRequest.endDate)

      if (data.length === 0) {
        toast.error('Không có dữ liệu để xuất')
        return
      }

      exportToExcel(data, categories, exportRequest.filename)
      toast.success(exportRequest.mode === 'all' ? 'Đã xuất tất cả dữ liệu' : 'Đã xuất dữ liệu theo khoảng thời gian')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Xuất file thất bại')
    } finally {
      setExporting(false)
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

        <PrivacySettingsSection categories={categories} />

        {/* Category Manager */}
        <div className="card settings-section animate-fade-in-up">
          <h3 className="settings-section-title">Quản lý danh mục</h3>
          <CategoryManager />
        </div>

        {/* Recurring Transactions */}
        <div className="card settings-section animate-fade-in-up">
          <h3 className="settings-section-title">Giao dịch định kỳ</h3>
          <RecurringManager />
        </div>

        {/* Export */}
        <div className="card settings-section animate-fade-in-up">
          <h3 className="settings-section-title">Xuất dữ liệu</h3>
          <p className="settings-desc">Xuất giao dịch ra file Excel theo toàn bộ dữ liệu hoặc khoảng thời gian đã chọn.</p>

          <div className="settings-export-mode" role="group" aria-label="Phạm vi xuất dữ liệu">
            <button
              type="button"
              className={`settings-export-mode-btn ${exportMode === 'all' ? 'active' : ''}`}
              onClick={() => selectExportMode('all')}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`settings-export-mode-btn ${exportMode === 'range' ? 'active' : ''}`}
              onClick={() => selectExportMode('range')}
            >
              Khoảng thời gian
            </button>
          </div>

          {exportMode === 'range' && (
            <div className="settings-export-range">
              <label className="settings-export-field">
                <span>Từ ngày</span>
                <input
                  className="input"
                  type="date"
                  value={exportStartDate}
                  max={exportEndDate || undefined}
                  onChange={(e) => setExportStartDate(e.target.value)}
                />
              </label>
              <label className="settings-export-field">
                <span>Đến ngày</span>
                <input
                  className="input"
                  type="date"
                  value={exportEndDate}
                  min={exportStartDate || undefined}
                  onChange={(e) => setExportEndDate(e.target.value)}
                />
              </label>
            </div>
          )}

          <button
            className="btn btn-outline settings-export-submit"
            onClick={handleExport}
            disabled={exporting || categoriesLoading}
          >
            <Download size={16} aria-hidden="true" />
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
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
