import { useState } from 'react'
import { parseVND } from '../../utils/formatCurrency'
import './GoalForm.css'

const PRESET_ICONS = ['🏦', '💵', '🏠', '🚗', '✈️', '💍', '🎓', '🏖️', '💻', '👶', '🛡️', '📈']
const PRESET_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#ef4444', '#6366f1']

const FUND_TYPES = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'bank', label: 'Ngân hàng' },
  { value: 'emergency', label: 'Khẩn cấp' },
  { value: 'investment', label: 'Đầu tư' },
  { value: 'sinking', label: 'Quỹ định kỳ' },
  { value: 'other', label: 'Khác' },
]

function formatInputAmount(value) {
  if (!value) return ''
  return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatDateInput(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

export function GoalForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [fundType, setFundType] = useState(initial?.fundType || 'bank')
  const [balance, setBalance] = useState(formatInputAmount(initial?.balance))
  const [monthlyContribution, setMonthlyContribution] = useState(
    formatInputAmount(initial?.monthlyContribution)
  )
  const [expectedReturnRate, setExpectedReturnRate] = useState(
    initial?.expectedReturnRate ? String(initial.expectedReturnRate) : ''
  )
  const [maturityDate, setMaturityDate] = useState(formatDateInput(initial?.maturityDate))
  const [note, setNote] = useState(initial?.note || '')
  const [icon, setIcon] = useState(initial?.icon || '🏦')
  const [color, setColor] = useState(initial?.color || '#3b82f6')
  const [submitting, setSubmitting] = useState(false)

  const handleMoneyChange = (setter) => (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setter(raw ? formatInputAmount(raw) : '')
  }

  const handleRateChange = (e) => {
    setExpectedReturnRate(e.target.value.replace(/[^\d.]/g, '').slice(0, 5))
  }

  const handleSubmit = async () => {
    if (!name.trim()) return

    setSubmitting(true)
    try {
      await onSave({
        name: name.trim(),
        fundType,
        balance: initial ? undefined : (parseVND(balance) || 0),
        monthlyContribution: parseVND(monthlyContribution) || 0,
        expectedReturnRate: Number(expectedReturnRate) || 0,
        maturityDate: maturityDate || null,
        note: note.trim(),
        icon,
        color,
      })
      onClose()
    } catch (err) {
      console.error('Failed to save savings fund:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog goal-form-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">
          {initial ? 'Sửa khoản tiết kiệm' : 'Thêm khoản tiết kiệm'}
        </h3>

        <div className="goal-form">
          <label className="txn-form-label">Tên khoản tiết kiệm</label>
          <input
            type="text"
            className="input"
            placeholder="Ví dụ: Quỹ khẩn cấp"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <label className="txn-form-label" style={{ marginTop: 12 }}>Loại khoản</label>
          <select className="input" value={fundType} onChange={(e) => setFundType(e.target.value)}>
            {FUND_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <label className="txn-form-label" style={{ marginTop: 12 }}>Số dư hiện tại</label>
          <input
            type="text"
            inputMode="numeric"
            className="input"
            placeholder="0"
            value={balance}
            onChange={handleMoneyChange(setBalance)}
          />

          <label className="txn-form-label" style={{ marginTop: 12 }}>Dự kiến góp mỗi tháng</label>
          <input
            type="text"
            inputMode="numeric"
            className="input"
            placeholder="0"
            value={monthlyContribution}
            onChange={handleMoneyChange(setMonthlyContribution)}
          />

          <label className="txn-form-label" style={{ marginTop: 12 }}>Lãi suất kỳ vọng / năm (%)</label>
          <input
            type="text"
            inputMode="decimal"
            className="input"
            placeholder="0"
            value={expectedReturnRate}
            onChange={handleRateChange}
          />

          <label className="txn-form-label" style={{ marginTop: 12 }}>Ngày đáo hạn (tùy chọn)</label>
          <input
            type="date"
            className="input"
            value={maturityDate}
            onChange={(e) => setMaturityDate(e.target.value)}
          />

          <label className="txn-form-label" style={{ marginTop: 12 }}>Ghi chú</label>
          <input
            type="text"
            className="input"
            placeholder="Nơi giữ tiền, kỳ hạn, mục đích..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <label className="txn-form-label" style={{ marginTop: 12 }}>Biểu tượng</label>
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

          <label className="txn-form-label" style={{ marginTop: 12 }}>Màu sắc</label>
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
        </div>

        <div className="dialog-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}
