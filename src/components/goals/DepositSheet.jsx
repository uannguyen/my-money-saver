import { useState, useRef } from 'react'
import { parseVND } from '../../utils/formatCurrency'
import './DepositSheet.css'

const QUICK_AMOUNTS = [
  { label: '50K', value: 50000 },
  { label: '100K', value: 100000 },
  { label: '200K', value: 200000 },
  { label: '500K', value: 500000 },
  { label: '1M', value: 1000000 },
]

export function DepositSheet({ goal, onDeposit, onClose }) {
  const [amountStr, setAmountStr] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const touchStartY = useRef(null)

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    if (raw === '') {
      setAmountStr('')
      return
    }
    setAmountStr(Number(raw).toLocaleString('vi-VN'))
  }

  const handleQuickAmount = (value) => {
    setAmountStr(value.toLocaleString('vi-VN'))
  }

  const handleSubmit = async () => {
    const amount = parseVND(amountStr)
    if (!amount || amount <= 0) return

    setSubmitting(true)
    try {
      const result = await onDeposit(goal.id, amount, note.trim())
      if (result?.isCompleted) {
        setShowConfetti(true)
        setTimeout(() => {
          setShowConfetti(false)
          onClose()
        }, 3000)
      } else {
        onClose()
      }
    } catch (err) {
      console.error('Deposit failed:', err)
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

  return (
    <div className="quick-sheet-overlay" onClick={onClose}>
      <div
        className="quick-sheet animate-slide-up deposit-sheet"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="quick-sheet-handle">
          <div className="quick-sheet-handle-bar" />
        </div>

        {/* Goal info */}
        <div className="deposit-goal-info">
          <span className="deposit-goal-icon">{goal.icon || '🎯'}</span>
          <span className="deposit-goal-name">{goal.name}</span>
        </div>

        {/* Amount input */}
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
          VND
        </div>

        {/* Quick amount buttons */}
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

        {/* Note */}
        <input
          className="input"
          type="text"
          placeholder="Ghi chú (tùy chọn)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginTop: 12 }}
        />

        {/* Deposit button */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={handleSubmit}
          disabled={submitting || !parseVND(amountStr)}
        >
          {submitting ? 'Đang nạp...' : 'Nạp'}
        </button>

        {/* Confetti */}
        {showConfetti && (
          <div className="confetti-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="confetti-piece" />
            ))}
            <div className="confetti-message">🎉 Hoàn thành mục tiêu!</div>
          </div>
        )}
      </div>
    </div>
  )
}
