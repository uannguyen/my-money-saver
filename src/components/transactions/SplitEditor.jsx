import { useState } from 'react'
import { formatVND } from '../../utils/formatCurrency'
import { CategoryPicker } from './CategoryPicker'
import { useCategories } from '../../hooks/useCategories'
import { ChevronRight } from 'lucide-react'
import './SplitEditor.css'

export function SplitEditor({ totalAmount, splits, onChange, type }) {
  const { parents, categories: allCats } = useCategories()
  const [pickerIndex, setPickerIndex] = useState(null)

  const splitsSum = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
  const remaining = totalAmount - splitsSum
  const isMatch = splitsSum === totalAmount

  function findCategory(categoryId) {
    let cat = allCats.find((c) => c.id === categoryId)
    if (!cat) cat = parents.find((c) => c.id === categoryId) || null
    return cat
  }

  function updateSplit(index, field, value) {
    const updated = splits.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    onChange(updated)
  }

  function removeSplit(index) {
    onChange(splits.filter((_, i) => i !== index))
  }

  function addSplit() {
    onChange([...splits, { categoryId: '', amount: 0, note: '' }])
  }

  function handleAmountChange(index, rawValue) {
    const cleaned = rawValue.replace(/[^\d]/g, '')
    if (cleaned === '') {
      updateSplit(index, 'amount', 0)
      return
    }
    updateSplit(index, 'amount', parseInt(cleaned, 10))
  }

  function formatAmountForInput(amount) {
    if (!amount) return ''
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  return (
    <div className="split-editor">
      {/* Header */}
      <div className="split-header">
        <span>Tổng: {formatVND(totalAmount)}</span>
        <span className={isMatch ? 'split-total-match' : 'split-total-mismatch'}>
          Đã chia: {formatVND(splitsSum)}
        </span>
      </div>

      {/* Split items */}
      {splits.map((split, index) => {
        const cat = findCategory(split.categoryId)
        return (
          <div className="split-item" key={index}>
            <button
              type="button"
              className="split-item-remove"
              onClick={() => removeSplit(index)}
            >
              ✕
            </button>

            {/* Category selector */}
            <div className="split-item-row">
              <button
                type="button"
                className={`txn-cat-selector ${cat ? 'has-value' : ''}`}
                onClick={() => setPickerIndex(index)}
                style={{ flex: 1 }}
              >
                {cat ? (
                  <>
                    <span className="txn-cat-icon">{cat.icon}</span>
                    <div className="txn-cat-info">
                      <span className="txn-cat-name">{cat.name}</span>
                      {cat.parentName ? (
                        <span className="txn-cat-parent">{cat.parentName}</span>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <span className="txn-cat-placeholder">Chọn danh mục</span>
                )}
                <ChevronRight size={18} className="txn-cat-chevron" />
              </button>
            </div>

            {/* Amount input */}
            <div className="split-item-row">
              <input
                type="text"
                inputMode="numeric"
                className="input"
                placeholder="0"
                value={formatAmountForInput(split.amount)}
                onChange={(e) => handleAmountChange(index, e.target.value)}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>đ</span>
            </div>

            {/* Note input */}
            <div className="split-item-row">
              <input
                type="text"
                className="input"
                placeholder="Ghi chú (tùy chọn)"
                value={split.note}
                onChange={(e) => updateSplit(index, 'note', e.target.value)}
                style={{ flex: 1, fontSize: '0.8125rem' }}
              />
            </div>
          </div>
        )
      })}

      {/* Category picker modal */}
      {pickerIndex !== null && (
        <CategoryPicker
          type={type}
          selectedId={splits[pickerIndex]?.categoryId || ''}
          onSelect={(sub) => {
            updateSplit(pickerIndex, 'categoryId', sub.id)
            setPickerIndex(null)
          }}
          onClose={() => setPickerIndex(null)}
        />
      )}

      {/* Add split button */}
      <button type="button" className="split-add-btn" onClick={addSplit}>
        + Thêm phần
      </button>

      {/* Remaining */}
      {remaining !== 0 && (
        <div className="split-remaining">
          Còn lại: {formatVND(remaining)}
        </div>
      )}
    </div>
  )
}
