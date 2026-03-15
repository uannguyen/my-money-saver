import { useState, useEffect } from 'react'
import { getTodayString, getTodayDateTimeString } from '../../utils/dateHelpers'
import { formatVND, parseVND } from '../../utils/formatCurrency'
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../../constants/categories'
import { CategoryForm } from '../categories/CategoryForm'
import { Plus } from 'lucide-react'
import './TransactionForm.css'

export function TransactionForm({ initial, categories, onCategoryAdded, onSubmit, onCancel }) {
  const [type, setType] = useState(initial?.type || 'expense')
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [amountStr, setAmountStr] = useState(
    initial?.amount ? formatVND(initial.amount).replace('đ', '') : ''
  )
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [date, setDate] = useState(
    initial?.date
      ? new Date(initial.date).toISOString().slice(0, 16)
      : getTodayDateTimeString()
  )
  const [note, setNote] = useState(initial?.note || '')
  const [submitting, setSubmitting] = useState(false)

  const allCategories = categories || []
  const filteredCategories = allCategories.filter(
    (c) => c.type === type || c.type === 'both'
  )

  // Reset categoryId when type changes if current selection doesn't match
  useEffect(() => {
    if (categoryId && !filteredCategories.find((c) => c.id === categoryId)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amount = parseVND(amountStr)
    if (!amount || !categoryId) return

    setSubmitting(true)
    try {
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

      {/* Category Grid */}
      <div className="txn-form-section">
        <label className="txn-form-label">Danh mục</label>
        <div className="category-grid">
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-item ${categoryId === cat.id ? 'selected' : ''}`}
              onClick={() => setCategoryId(cat.id)}
            >
              <span className="emoji">{cat.icon}</span>
              <span className="label">{cat.name}</span>
            </button>
          ))}
          <button
            type="button"
            className="category-item add-category-btn"
            onClick={() => setShowCategoryForm(true)}
          >
            <span className="emoji"><Plus size={20} /></span>
            <span className="label">Thêm</span>
          </button>
        </div>
      </div>

      {showCategoryForm && (
        <CategoryForm
          type={type}
          onAdded={onCategoryAdded}
          onClose={() => setShowCategoryForm(false)}
        />
      )}

      {/* Date */}
      <div className="txn-form-section">
        <label className="txn-form-label">Ngày giờ</label>
        <input
          type="datetime-local"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
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
