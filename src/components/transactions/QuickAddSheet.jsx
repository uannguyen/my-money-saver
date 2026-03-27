import { useState, useRef } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { parseVND } from '../../utils/formatCurrency'
import './QuickAddSheet.css'

export function QuickAddSheet({ open, onClose, onSave }) {
  const { parents } = useCategories()
  const [type, setType] = useState('expense')
  const [amountStr, setAmountStr] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const touchStartY = useRef(null)
  const sheetRef = useRef(null)

  const filteredSubs = parents
    .filter((p) => p.type === type)
    .flatMap((p) => p.subs.map((s) => ({ ...s, parentId: p.id })))
    .slice(0, 12)

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    if (raw === '') {
      setAmountStr('')
      return
    }
    setAmountStr(Number(raw).toLocaleString('vi-VN'))
  }

  const handleSubmit = async () => {
    const amount = parseVND(amountStr)
    if (!amount || amount <= 0) return
    if (!categoryId) return

    setSubmitting(true)
    try {
      await onSave({
        type,
        amount,
        categoryId,
        note: note.trim(),
        date: new Date().toISOString(),
      })
      // Reset form
      setAmountStr('')
      setCategoryId('')
      setNote('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 80) {
      touchStartY.current = null
      onClose()
    }
  }

  const handleTouchEnd = () => {
    touchStartY.current = null
  }

  if (!open) return null

  return (
    <div className="quick-sheet-overlay" onClick={onClose}>
      <div
        ref={sheetRef}
        className="quick-sheet animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="quick-sheet-handle">
          <div className="quick-sheet-handle-bar" />
        </div>

        {/* Type Toggle */}
        <div className="type-toggle" style={{ marginBottom: 12 }}>
          <button
            className={type === 'expense' ? 'active-expense' : ''}
            onClick={() => { setType('expense'); setCategoryId('') }}
          >
            Chi tiêu
          </button>
          <button
            className={type === 'income' ? 'active-income' : ''}
            onClick={() => { setType('income'); setCategoryId('') }}
          >
            Thu nhập
          </button>
        </div>

        {/* Amount */}
        <input
          className="amount-input"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amountStr}
          onChange={handleAmountChange}
          autoFocus
        />
        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
          VNĐ
        </div>

        {/* Category Grid */}
        <div className="quick-sheet-categories">
          {filteredSubs.map((sub) => (
            <button
              key={sub.id}
              className={`category-item ${categoryId === sub.id ? 'selected' : ''}`}
              onClick={() => setCategoryId(sub.id)}
            >
              <span className="emoji">{sub.icon}</span>
              <span className="label">{sub.name}</span>
            </button>
          ))}
        </div>

        {/* Note */}
        <input
          className="input"
          type="text"
          placeholder="Ghi chú (tùy chọn)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginTop: 12 }}
        />

        {/* Save Button */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={handleSubmit}
          disabled={submitting || !parseVND(amountStr) || !categoryId}
        >
          {submitting ? 'Đang lưu...' : 'Lưu nhanh'}
        </button>
      </div>
    </div>
  )
}
