import { useState } from 'react'
import { parseVND } from '../../utils/formatCurrency'
import './GoalForm.css'

const PRESET_ICONS = ['🎯', '🏠', '🚗', '✈️', '📱', '💍', '🎓', '🏖️', '💻', '🎮', '👶', '💊']
const PRESET_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#ef4444', '#6366f1']

export function GoalForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [targetAmount, setTargetAmount] = useState(
    initial?.targetAmount
      ? initial.targetAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : ''
  )
  const [icon, setIcon] = useState(initial?.icon || '🎯')
  const [color, setColor] = useState(initial?.color || '#3b82f6')
  const [deadline, setDeadline] = useState(
    initial?.deadline
      ? (initial.deadline instanceof Date
          ? initial.deadline.toISOString().split('T')[0]
          : new Date(initial.deadline).toISOString().split('T')[0])
      : ''
  )
  const [submitting, setSubmitting] = useState(false)

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    if (!raw) {
      setTargetAmount('')
      return
    }
    setTargetAmount(
      parseInt(raw).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    const amount = parseVND(targetAmount)
    if (!amount || amount <= 0) return

    setSubmitting(true)
    try {
      await onSave({
        name: name.trim(),
        targetAmount: amount,
        icon,
        color,
        deadline: deadline || null,
      })
      onClose()
    } catch (err) {
      console.error('Failed to save goal:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog goal-form-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">
          {initial ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}
        </h3>

        <div className="goal-form">
          <label className="txn-form-label">Tên mục tiêu</label>
          <input
            type="text"
            className="input"
            placeholder="Ví dụ: Mua xe máy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <label className="txn-form-label" style={{ marginTop: 12 }}>
            Số tiền mục tiêu (VND)
          </label>
          <input
            type="text"
            inputMode="numeric"
            className="input"
            placeholder="10.000.000"
            value={targetAmount}
            onChange={handleAmountChange}
          />

          <label className="txn-form-label" style={{ marginTop: 12 }}>
            Biểu tượng
          </label>
          <div className="goal-form-icons">
            {PRESET_ICONS.map((e) => (
              <button
                key={e}
                type="button"
                className={`goal-icon-btn ${icon === e ? 'selected' : ''}`}
                onClick={() => setIcon(e)}
              >
                {e}
              </button>
            ))}
          </div>

          <label className="txn-form-label" style={{ marginTop: 12 }}>
            Màu sắc
          </label>
          <div className="goal-form-colors">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`goal-color-btn ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <label className="txn-form-label" style={{ marginTop: 12 }}>
            Hạn chót (tùy chọn)
          </label>
          <input
            type="date"
            className="input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="dialog-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !parseVND(targetAmount)}
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}
