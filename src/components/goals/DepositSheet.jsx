import { useState } from 'react'
import { parseVND } from '../../utils/formatCurrency'
import { PrivacyAmount } from '../privacy/PrivacyAmount'
import './DepositSheet.css'

const QUICK_AMOUNTS = [
  { label: '500K', value: 500000 },
  { label: '1M', value: 1000000 },
  { label: '2M', value: 2000000 },
  { label: '5M', value: 5000000 },
]

const TYPE_CONFIG = {
  deposit: { title: 'Thêm tiền', amountLabel: 'Số tiền thêm', button: 'Thêm tiền' },
  withdraw: { title: 'Rút tiền', amountLabel: 'Số tiền rút', button: 'Rút tiền' },
}

export function DepositSheet({ goal, initialType = 'deposit', onMovement, onClose }) {
  const [type, setType] = useState(initialType)
  const [amountStr, setAmountStr] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const config = TYPE_CONFIG[type]

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setAmountStr(raw ? Number(raw).toLocaleString('vi-VN') : '')
  }

  const handleQuickAmount = (value) => {
    setAmountStr(value.toLocaleString('vi-VN'))
  }

  const handleSubmit = async () => {
    setError('')
    const amount = parseVND(amountStr)
    if (amountStr === '' || amount <= 0) return
    if (type === 'withdraw' && amount > (goal.balance || 0)) {
      setError('Số tiền rút không được lớn hơn số dư')
      return
    }

    setSubmitting(true)
    try {
      await onMovement(goal.id, { type, amount, note: note.trim() })
      onClose()
    } catch (err) {
      console.error('Savings movement failed:', err)
      setError('Không thể cập nhật khoản tiết kiệm')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog deposit-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="dialog-title">{config.title}</h3>

        <div className="deposit-goal-info">
          <span className="deposit-goal-icon">{goal.icon || '🏦'}</span>
          <span className="deposit-goal-name">{goal.name}</span>
        </div>

        <div className="deposit-balance-row">
          <span>Số dư hiện tại</span>
          <PrivacyAmount amount={goal.balance || 0} />
        </div>

        <div className="deposit-type-tabs">
          {Object.entries(TYPE_CONFIG).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={type === key ? 'active' : ''}
              onClick={() => {
                setType(key)
                setAmountStr('')
                setError('')
              }}
            >
              {item.title}
            </button>
          ))}
        </div>

        <label className="txn-form-label">{config.amountLabel}</label>
        <input
          className="amount-input"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amountStr}
          onChange={handleAmountChange}
          autoFocus
        />

        <div className="deposit-quick-amounts">
          {QUICK_AMOUNTS.map((qa) => (
            <button
              key={qa.value}
              type="button"
              className="deposit-quick-btn"
              onClick={() => handleQuickAmount(qa.value)}
            >
              {qa.label}
            </button>
          ))}
        </div>

        <input
          className="input"
          type="text"
          placeholder="Ghi chú (tùy chọn)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginTop: 12 }}
        />

        {error && <div className="deposit-error">{error}</div>}

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={handleSubmit}
          disabled={submitting || amountStr === '' || !parseVND(amountStr)}
        >
          {submitting ? 'Đang lưu...' : config.button}
        </button>
      </div>
    </div>
  )
}
