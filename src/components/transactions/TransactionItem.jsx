import { useState, useRef, useEffect } from 'react'
import { formatVND } from '../../utils/formatCurrency'
import { getCategoryById } from '../../constants/categories'
import './TransactionItem.css'

const REVEAL_THRESHOLD = 60
const REVEAL_WIDTH = 64

export function TransactionItem({ transaction, categories, onEdit, onDelete }) {
  const category = getCategoryById(categories, transaction.categoryId)
  const isExpense = transaction.type === 'expense'

  // ── Swipe state ──────────────────────────────────────────────────────────
  const [translateX, setTranslateX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(null)
  const containerRef = useRef(null)

  const isRevealed = translateX <= -REVEAL_THRESHOLD

  // Close when tapping outside this item
  useEffect(() => {
    if (!isRevealed) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setTranslateX(0)
      }
    }
    document.addEventListener('touchstart', handler, { passive: true })
    return () => document.removeEventListener('touchstart', handler)
  }, [isRevealed])

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (startX.current === null) return
    const delta = startX.current - e.touches[0].clientX
    if (delta > 0) {
      // Swiping left → reveal
      setTranslateX(-Math.min(delta, REVEAL_WIDTH))
    } else if (isRevealed) {
      // Swiping right while revealed → close
      setTranslateX(Math.max(-REVEAL_WIDTH, -REVEAL_WIDTH - delta))
    }
  }

  const handleTouchEnd = (e) => {
    setSwiping(false)
    if (startX.current === null) return
    const delta = startX.current - e.changedTouches[0].clientX

    // Full swipe (>80% width) → auto-delete
    if (containerRef.current && delta > containerRef.current.offsetWidth * 0.8) {
      if (navigator.vibrate) navigator.vibrate(50)
      onDelete?.(transaction)
      setTranslateX(0)
      startX.current = null
      return
    }

    if (Math.abs(translateX) >= REVEAL_THRESHOLD) {
      setTranslateX(-REVEAL_WIDTH) // snap open
    } else {
      setTranslateX(0) // snap closed
    }
    startX.current = null
  }

  const handleClick = () => {
    if (isRevealed) {
      setTranslateX(0)
      return
    }
    onEdit?.(transaction)
  }

  return (
    <div className="txn-swipe-container" ref={containerRef}>
      {/* Delete button — hidden behind, revealed on swipe */}
      <div
        className="txn-swipe-delete"
        style={{ transform: `translateX(${REVEAL_WIDTH + translateX}px)` }}
      >
        <button
          className="txn-swipe-delete-btn"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(transaction)
            setTranslateX(0)
          }}
          aria-label="Xóa"
        >
          🗑️
        </button>
      </div>

      {/* Main transaction row */}
      <div
        className="txn-item animate-fade-in-up"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: swiping ? 'none' : 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="txn-item-left">
          <span className="txn-item-icon">{category.icon}</span>
          <div className="txn-item-info">
            <span className="txn-item-category">{category.name}</span>
            {transaction.isSplit && <span className="txn-item-split-badge">✂️ Chia</span>}
            {transaction.note && (
              <span className="txn-item-note">{transaction.note}</span>
            )}
          </div>
        </div>
        <div className="txn-item-right">
          <span className={`txn-item-amount ${isExpense ? 'expense' : 'income'}`}>
            {isExpense ? '-' : '+'}{formatVND(transaction.amount)}
          </span>
          {/* Desktop-only hover delete */}
          <button
            className="txn-item-delete-hover"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(transaction)
            }}
            aria-label="Xóa"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
