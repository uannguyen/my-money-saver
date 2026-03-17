import { useState, useEffect } from 'react'
import { getTodayDateTimeString } from '../../utils/dateHelpers'
import { formatVND, parseVND } from '../../utils/formatCurrency'
import { useCategories } from '../../hooks/useCategories'
import { CategoryPicker } from './CategoryPicker'
import { Clock, CalendarDays, ChevronRight } from 'lucide-react'
import './TransactionForm.css'

// ─── Persist last-used datetime across consecutive transactions ─────────────
const STORAGE_KEY = 'txn_last_datetime'

function getInitialDateTime(initial) {
  if (initial?.date) {
    return new Date(initial.date).toISOString().slice(0, 16)
  }
  const stored = sessionStorage.getItem(STORAGE_KEY)
  return stored || getTodayDateTimeString()
}

function saveLastDateTime(dt) {
  sessionStorage.setItem(STORAGE_KEY, dt)
}

export function TransactionForm({ initial, categories, onCategoryAdded, onSubmit, onCancel }) {
  const { parents, categories: allCats } = useCategories()
  const [type, setType] = useState(initial?.type || 'expense')
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [amountStr, setAmountStr] = useState(
    initial?.amount ? formatVND(initial.amount).replace('đ', '') : ''
  )
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [date, setDate] = useState(() => getInitialDateTime(initial))
  const [note, setNote] = useState(initial?.note || '')
  const [submitting, setSubmitting] = useState(false)

  // Find selected category info for display
  const selectedCat = allCats.find((c) => c.id === categoryId) || null

  // Reset categoryId when type changes if current selection doesn't match
  useEffect(() => {
    if (selectedCat && selectedCat.type !== type) {
      setCategoryId('')
    }
  }, [type])

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    if (raw === '') {
      setAmountStr('')
      return
    }
    const num = parseInt(raw, 10)
    setAmountStr(num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
  }

  const setCurrentTime = () => {
    setDate(getTodayDateTimeString())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amount = parseVND(amountStr)
    if (!amount || !categoryId) return

    setSubmitting(true)
    try {
      saveLastDateTime(date) // persist for next transaction
      await onSubmit({
        type,
        amount,
        categoryId,
        date,
        note: note.trim(),
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Format date for display
  const dateObj = new Date(date)
  const displayDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`
  const displayTime = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`

  return (
    <form className="txn-form" onSubmit={handleSubmit}>
      {/* Type Toggle */}
      <div className="type-toggle">
        <button
          type="button"
          className={type === 'expense' ? 'active-expense' : ''}
          onClick={() => setType('expense')}
        >
          Chi tiêu
        </button>
        <button
          type="button"
          className={type === 'income' ? 'active-income' : ''}
          onClick={() => setType('income')}
        >
          Thu nhập
        </button>
      </div>

      {/* Amount Input */}
      <div className="txn-form-amount-wrapper">
        <input
          type="text"
          inputMode="numeric"
          className="amount-input"
          placeholder="0"
          value={amountStr}
          onChange={handleAmountChange}
          autoFocus
        />
        <span className="txn-form-currency">đ</span>
      </div>

      {/* Category Selector (tap to open picker) */}
      <div className="txn-form-section">
        <label className="txn-form-label">Danh mục</label>
        <button
          type="button"
          className={`txn-cat-selector ${selectedCat ? 'has-value' : ''}`}
          onClick={() => setShowCategoryPicker(true)}
        >
          {selectedCat ? (
            <>
              <span className="txn-cat-icon">{selectedCat.icon}</span>
              <div className="txn-cat-info">
                <span className="txn-cat-name">{selectedCat.name}</span>
                <span className="txn-cat-parent">{selectedCat.parentName}</span>
              </div>
            </>
          ) : (
            <span className="txn-cat-placeholder">Chọn danh mục</span>
          )}
          <ChevronRight size={18} className="txn-cat-chevron" />
        </button>
      </div>

      {showCategoryPicker && (
        <CategoryPicker
          type={type}
          selectedId={categoryId}
          onSelect={(sub) => {
            setCategoryId(sub.id)
            setShowCategoryPicker(false)
          }}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}

      {/* Date & Time */}
      <div className="txn-form-section">
        <label className="txn-form-label">Ngày giờ</label>
        <div className="txn-datetime-row">
          <div className="txn-datetime-input-wrapper">
            <CalendarDays size={16} className="txn-datetime-icon" />
            <input
              type="date"
              className="txn-date-input"
              value={date.slice(0, 10)}
              onChange={(e) => setDate(e.target.value + 'T' + date.slice(11, 16))}
            />
          </div>
          <div className="txn-datetime-input-wrapper">
            <Clock size={16} className="txn-datetime-icon" />
            <div className="txn-time-input custom-time-picker">
              <select
                className="txn-time-select"
                value={date.slice(11, 13)}
                onChange={(e) => setDate(date.slice(0, 10) + 'T' + e.target.value + ':' + date.slice(14, 16))}
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = String(i).padStart(2, '0')
                  return <option key={h} value={h}>{h}</option>
                })}
              </select>
              <span className="txn-time-separator">:</span>
              <select
                className="txn-time-select"
                value={date.slice(14, 16)}
                onChange={(e) => setDate(date.slice(0, 10) + 'T' + date.slice(11, 13) + ':' + e.target.value)}
              >
                {Array.from({ length: 60 }).map((_, i) => {
                  const m = String(i).padStart(2, '0')
                  return <option key={m} value={m}>{m}</option>
                })}
              </select>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="txn-current-time-btn"
          onClick={setCurrentTime}
        >
          <Clock size={14} />
          Giờ hiện tại
        </button>
      </div>

      {/* Note */}
      <div className="txn-form-section">
        <label className="txn-form-label">Ghi chú</label>
        <textarea
          className="input txn-form-note"
          placeholder="Thêm ghi chú..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="txn-form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Hủy
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary txn-form-submit"
          disabled={!parseVND(amountStr) || !categoryId || submitting}
        >
          {submitting ? 'Đang lưu...' : initial ? 'Cập nhật' : 'Lưu'}
        </button>
      </div>
    </form>
  )
}
