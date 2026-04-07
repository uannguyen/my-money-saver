import { useState, useEffect, useRef } from 'react'
import { getTodayDateTimeString } from '../../utils/dateHelpers'
import { formatVND, parseVND } from '../../utils/formatCurrency'
import { useCategories } from '../../hooks/useCategories'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'
import { useCategorySuggestion } from '../../hooks/useCategorySuggestion'
import { useMostUsedCategories } from '../../hooks/useMostUsedCategories'
import { useDebounce } from '../../hooks/useDebounce'
import { CategoryPicker } from './CategoryPicker'
import { MostUsedCategories } from './MostUsedCategories'
import { EditMostUsedModal } from './EditMostUsedModal'
import { SplitEditor } from './SplitEditor'
import { ImageAttachment } from './ImageAttachment'
import { DateTimePickerModal } from './DateTimePickerModal'
import { CalcKeyboard } from './CalcKeyboard'
import { Clock, CalendarDays, ChevronRight, Camera } from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'
import './TransactionForm.css'

function evalExpressionForDisplay(expr) {
  const safe = expr.replace(/×/g, '*').replace(/÷/g, '/')
  if (!/^[\d+\-*/. ]+$/.test(safe)) return null
  try {
    const result = Function('"use strict"; return (' + safe + ')')()
    if (!isFinite(result) || result < 0) return null
    return Math.round(result)
  } catch {
    return null
  }
}

// ─── Persist last-used datetime across consecutive transactions ─────────────
const STORAGE_KEY = 'txn_last_datetime'

function getInitialDateTime(initial) {
  if (initial?.date) {
    const d = initial.date instanceof Date ? initial.date : new Date(initial.date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day}T${h}:${min}`
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
  const [showDateTimePicker, setShowDateTimePicker] = useState(false)
  const [pickerTab, setPickerTab] = useState('calendar')
  const [amountStr, setAmountStr] = useState(
    initial?.amount ? String(initial.amount) : ''
  )
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '')
  const [categoryError, setCategoryError] = useState('')
  const [date, setDate] = useState(() => getInitialDateTime(initial))
  const [note, setNote] = useState(initial?.note || '')
  const [submitting, setSubmitting] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
  const [isSplit, setIsSplit] = useState(initial?.splits?.length > 0 || false)
  const [splits, setSplits] = useState(initial?.splits || [])
  const [showEditMostUsed, setShowEditMostUsed] = useState(false)
  const {
    previewUrl: imagePreviewUrl,
    imageFile,
    uploading: imageUploading,
    removed: imageRemoved,
    initialImageUrl,
    selectImage,
    removeImage,
    uploadImage,
  } = useImageUpload(initial?.imageUrl)
  const userHasManuallySelected = useRef(false)
  const hasAutoSelected = useRef(false)

  // Category suggestion
  const { transactions: recentTransactions } = useRecentTransactions(30)
  const debouncedAmount = useDebounce(
    (/[+\-×÷]/.test(amountStr)
      ? evalExpressionForDisplay(amountStr)
      : amountStr.includes('.')
        ? (parseInt(amountStr.replace('.', ''), 10) || 0)
        : parseVND(amountStr)
    ) || 0,
    400
  )
  const suggestions = useCategorySuggestion(recentTransactions, debouncedAmount, type)
  const { mostUsed, pinnedIds, savePinned, refetch: refetchMostUsed } = useMostUsedCategories(type)

  // Find selected category info for display
  let selectedCat = allCats.find((c) => c.id === categoryId)
  if (!selectedCat) {
    selectedCat = parents.find((c) => c.id === categoryId) || null
  }

  // Reset categoryId when type changes if current selection doesn't match
  useEffect(() => {
    if (selectedCat && selectedCat.type !== type) {
      setCategoryId('')
      userHasManuallySelected.current = false
      hasAutoSelected.current = false
    }
  }, [type])

  // Auto-select top suggestion when amount changes
  useEffect(() => {
    if (
      suggestions.length > 0 &&
      !userHasManuallySelected.current &&
      !hasAutoSelected.current &&
      !initial?.categoryId
    ) {
      setCategoryId(suggestions[0].categoryId)
      hasAutoSelected.current = true
    }
  }, [suggestions])

  // Clear category error when a category is selected
  useEffect(() => {
    if (categoryId) setCategoryError('')
  }, [categoryId])

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    if (raw === '') {
      setAmountStr('')
      return
    }
    const num = parseInt(raw, 10)
    setAmountStr(num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
  }

  // Get numeric value from expression or plain string
  const getAmountValue = () => {
    const hasOp = /[+\-×÷]/.test(amountStr)
    if (hasOp) return evalExpressionForDisplay(amountStr) || 0
    // Decimal notation: "11.5000" → remove dot → 115000 (user shifts decimal with 000 presses)
    if (amountStr.includes('.')) {
      const val = parseInt(amountStr.replace('.', ''), 10)
      return isNaN(val) ? 0 : val
    }
    return parseVND(amountStr)
  }

  // Format expression for display: format each number segment with dot separators
  const displayAmountStr = () => {
    if (!amountStr) return ''
    // Decimal notation ending with 0: "11.5000" → remove dot → 115000 → "115.000"
    if (!(/[+\-×÷]/.test(amountStr)) && amountStr.includes('.') && amountStr.endsWith('0')) {
      const num = parseInt(amountStr.replace('.', ''), 10)
      if (!isNaN(num)) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    // Otherwise format each numeric segment (handles operators and trailing decimals like "11.5")
    return amountStr.replace(/(\d+)/g, (n) => {
      const num = parseInt(n, 10)
      return isNaN(num) ? n : num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    })
  }

  const setCurrentTime = () => {
    setDate(getTodayDateTimeString())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amount = getAmountValue()
    if (!amount) return

    if (isSplit) {
      // Validate splits
      const allHaveCategory = splits.every(s => s.categoryId)
      const allHaveAmount = splits.every(s => Number(s.amount) > 0)
      const splitsSum = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
      if (!allHaveCategory) {
        setCategoryError('Vui lòng chọn danh mục cho tất cả phần chia')
        return
      }
      if (!allHaveAmount) {
        setCategoryError('Mỗi phần chia phải có số tiền > 0')
        return
      }
      if (splitsSum !== amount) {
        setCategoryError('Tổng các phần chia phải bằng số tiền giao dịch')
        return
      }
    } else {
      if (!categoryId) {
        setCategoryError('Vui lòng chọn danh mục')
        return
      }
    }

    setSubmitting(true)
    try {
      saveLastDateTime(date) // persist for next transaction
      await onSubmit({
        type,
        amount,
        categoryId: isSplit ? (splits[0]?.categoryId || '') : categoryId,
        date,
        note: note.trim(),
        _imageFile: imageFile,
        _existingImageUrl: initialImageUrl,
        _imageRemoved: imageRemoved,
        ...(isSplit ? { isSplit: true, splits } : {}),
        ...(isRecurring && !initial ? { isRecurring: true, frequency } : {}),
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Format date for display in trigger button
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

      {/* Amount Display — tap to open calculator keyboard */}
      <div
        className={`txn-form-amount-wrapper${showKeyboard ? ' is-active' : ''}`}
        onClick={() => setShowKeyboard(true)}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-label="Nhập số tiền"
      >
        <span className="amount-input" style={{ minWidth: 80, textAlign: 'right' }}>
          {displayAmountStr() || <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>0</span>}
        </span>
        <span className="txn-form-currency">đ</span>
      </div>

      {/* Calculator Keyboard */}
      {showKeyboard && (
        <CalcKeyboard
          expression={amountStr}
          onChange={setAmountStr}
          onDone={() => setShowKeyboard(false)}
        />
      )}

      {/* Most Used category grid */}
      {!isSplit && (
        <MostUsedCategories
          mostUsed={mostUsed}
          selectedCategoryId={categoryId}
          onSelect={(id) => {
            userHasManuallySelected.current = true
            setCategoryId(id)
            setCategoryError('')
          }}
          onEdit={() => setShowEditMostUsed(true)}
          categories={allCats}
        />
      )}

      {/* Edit Most Used Modal */}
      {showEditMostUsed && (
        <EditMostUsedModal
          pinnedIds={pinnedIds}
          onSave={async (ids) => {
            await savePinned(ids)
            refetchMostUsed()
          }}
          onClose={() => setShowEditMostUsed(false)}
        />
      )}

      {/* Split Editor OR Category Selector */}
      {isSplit ? (
        <div className="txn-form-section">
          <SplitEditor totalAmount={getAmountValue()} splits={splits} onChange={setSplits} type={type} />
        </div>
      ) : (
      <>
      {/* Category Selector (tap to open picker) */}
      <div className="txn-form-section">
        <button
          type="button"
          className={`txn-cat-selector ${selectedCat ? 'has-value' : ''} ${categoryError ? 'has-error' : ''}`}
          onClick={() => setShowCategoryPicker(true)}
        >
          {selectedCat ? (
            <>
              <span className="txn-cat-icon">{selectedCat.icon}</span>
              <div className="txn-cat-info">
                <span className="txn-cat-name">{selectedCat.name}</span>
                {selectedCat.parentName ? (
                  <span className="txn-cat-parent">{selectedCat.parentName}</span>
                ) : null}
              </div>
            </>
          ) : (
            <span className="txn-cat-placeholder">Chọn danh mục</span>
          )}
          <ChevronRight size={18} className="txn-cat-chevron" />
        </button>
        {categoryError && (
          <span className="txn-cat-error">{categoryError}</span>
        )}
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
      </>
      )}

      {/* Date & Time — dual trigger buttons */}
      <div className="txn-form-section">
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="txn-datetime-trigger"
            onClick={() => { setPickerTab('calendar'); setShowDateTimePicker(true); }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <CalendarDays size={16} className="txn-datetime-trigger-icon" />
            <span className="txn-datetime-trigger-date">{displayDate}</span>
          </button>
          
          <button
            type="button"
            className="txn-datetime-trigger"
            onClick={() => { setPickerTab('time'); setShowDateTimePicker(true); }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Clock size={16} className="txn-datetime-trigger-icon" />
            <span className="txn-datetime-trigger-time">{displayTime}</span>
          </button>
        </div>

        <button
          type="button"
          className="txn-current-time-btn"
          onClick={setCurrentTime}
        >
          <Clock size={14} />
          Giờ hiện tại
        </button>

        {showDateTimePicker && (
          <DateTimePickerModal
            dateStr={date}
            initialTab={pickerTab}
            onClose={() => setShowDateTimePicker(false)}
            onConfirm={(newDateStr) => {
              setDate(newDateStr)
              setShowDateTimePicker(false)
            }}
          />
        )}
      </div>

      {/* Note */}
      <div className="txn-form-section">
        <textarea
          className="input txn-form-note"
          placeholder="Thêm ghi chú..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      {/* Image Attachment */}
      <div className="txn-form-section">
        <ImageAttachment
          previewUrl={imagePreviewUrl}
          onSelectImage={selectImage}
          onRemoveImage={removeImage}
          uploading={imageUploading}
        />
      </div>

      {/* Split Toggle — after note */}
      {getAmountValue() > 0 && (
        <button type="button" className="txn-split-toggle" onClick={() => { setIsSplit(!isSplit); if (!isSplit) setSplits([{ categoryId: '', amount: 0, note: '' }]) }}>
          {isSplit ? '✕ Hủy chia' : '✂️ Chia giao dịch'}
        </button>
      )}

      {/* Recurring Toggle (only for new transactions) */}
      {!initial && (
        <div className="txn-form-section">
          <div className="txn-recurring-toggle">
            <span className="txn-form-label" style={{ margin: 0 }}>🔄 Lặp lại</span>
            <label className="txn-toggle-switch">
              <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
              <span className="txn-toggle-slider" />
            </label>
          </div>
          {isRecurring && (
            <div className="txn-recurring-freq">
              {[
                ['daily', 'Hàng ngày'],
                ['weekly', 'Hàng tuần'],
                ['monthly', 'Hàng tháng'],
                ['yearly', 'Hàng năm'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`txn-freq-btn ${frequency === key ? 'active' : ''}`}
                  onClick={() => setFrequency(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
          disabled={!getAmountValue() || submitting}
        >
          {submitting ? 'Đang lưu...' : initial ? 'Cập nhật' : 'Lưu'}
        </button>
      </div>
    </form>
  )
}
