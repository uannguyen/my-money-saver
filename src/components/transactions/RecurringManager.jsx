import { useState } from 'react'
import { useRecurring } from '../../hooks/useRecurring'
import { useCategories } from '../../hooks/useCategories'
import { getCategoryById } from '../../constants/categories'
import { CategoryPicker } from './CategoryPicker'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { formatVND, parseVND } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateHelpers'
import { computeNextDueDate } from '../../services/recurringService'
import toast from 'react-hot-toast'
import './RecurringManager.css'

const FREQ_LABELS = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
  yearly: 'Hàng năm',
}

export function RecurringManager() {
  const { recurrings, loading, addRecurring, updateRecurring, deleteRecurring, toggleActive } = useRecurring()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Form state
  const [formType, setFormType] = useState('expense')
  const [formAmount, setFormAmount] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formFrequency, setFormFrequency] = useState('monthly')
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setFormType('expense')
    setFormAmount('')
    setFormCategoryId('')
    setFormNote('')
    setFormFrequency('monthly')
    setEditTarget(null)
    setShowForm(false)
  }

  const openEdit = (r) => {
    setEditTarget(r)
    setFormType(r.type)
    setFormAmount(r.amount.toLocaleString('vi-VN'))
    setFormCategoryId(r.categoryId)
    setFormNote(r.note || '')
    setFormFrequency(r.frequency)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    const amount = parseVND(formAmount)
    if (!amount || !formCategoryId) return

    setSubmitting(true)
    try {
      if (editTarget) {
        await updateRecurring(editTarget.id, {
          type: formType,
          amount,
          categoryId: formCategoryId,
          note: formNote,
          frequency: formFrequency,
        })
        toast.success('Đã cập nhật')
      } else {
        const now = new Date()
        await addRecurring({
          type: formType,
          amount,
          categoryId: formCategoryId,
          note: formNote,
          frequency: formFrequency,
          startDate: now,
          nextDueDate: computeNextDueDate(now, formFrequency),
          isActive: true,
        })
        toast.success('Đã thêm giao dịch định kỳ')
      }
      resetForm()
    } catch {
      toast.error('Thao tác thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteRecurring(deleteTarget.id)
      toast.success('Đã xóa')
    } catch {
      toast.error('Xóa thất bại')
    }
    setDeleteTarget(null)
  }

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    if (raw === '') { setFormAmount(''); return }
    setFormAmount(Number(raw).toLocaleString('vi-VN'))
  }

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>
  }

  return (
    <div className="recurring-manager">
      {recurrings.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <span className="icon">🔄</span>
          <span className="title">Chưa có giao dịch định kỳ</span>
        </div>
      ) : (
        <div className="recurring-list">
          {recurrings.map((r) => {
            const cat = getCategoryById(categories, r.categoryId)
            return (
              <div key={r.id} className="recurring-card card">
                <div className="recurring-card-header">
                  <div className="recurring-card-left">
                    <span className="recurring-card-icon">{cat.icon}</span>
                    <div className="recurring-card-info">
                      <span className="recurring-card-name">{cat.name}</span>
                      <span className="recurring-card-freq">{FREQ_LABELS[r.frequency]}</span>
                      {r.nextDueDate && (
                        <span className="recurring-card-next">Tiếp: {formatDate(r.nextDueDate)}</span>
                      )}
                    </div>
                  </div>
                  <div className="recurring-card-right">
                    <span className={`recurring-card-amount ${r.type}`}>
                      {r.type === 'expense' ? '-' : '+'}{formatVND(r.amount)}
                    </span>
                    <div className="recurring-card-actions">
                      <label className="recurring-toggle">
                        <input
                          type="checkbox"
                          checked={r.isActive}
                          onChange={(e) => toggleActive(r.id, e.target.checked)}
                        />
                        <span className="recurring-toggle-slider" />
                      </label>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.875rem' }} onClick={() => openEdit(r)}>✏️</button>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.875rem' }} onClick={() => setDeleteTarget(r)}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => setShowForm(true)}>
        + Thêm giao dịch định kỳ
      </button>

      {/* Form Modal */}
      {showForm && (
        <div className="overlay" onClick={resetForm}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '90vw', maxWidth: 400 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.0625rem', fontWeight: 700 }}>
              {editTarget ? 'Sửa giao dịch định kỳ' : 'Thêm giao dịch định kỳ'}
            </h3>

            {/* Type */}
            <div className="type-toggle" style={{ marginBottom: 12 }}>
              <button className={formType === 'expense' ? 'active-expense' : ''} onClick={() => { setFormType('expense'); setFormCategoryId('') }}>Chi tiêu</button>
              <button className={formType === 'income' ? 'active-income' : ''} onClick={() => { setFormType('income'); setFormCategoryId('') }}>Thu nhập</button>
            </div>

            {/* Amount */}
            <input className="input" type="text" inputMode="numeric" placeholder="Số tiền" value={formAmount} onChange={handleAmountChange} style={{ marginBottom: 12 }} />

            {/* Category */}
            <button
              className="input"
              style={{ textAlign: 'left', marginBottom: 12, cursor: 'pointer', color: formCategoryId ? 'var(--color-text)' : 'var(--color-text-muted)' }}
              onClick={() => setShowCategoryPicker(true)}
            >
              {formCategoryId
                ? `${getCategoryById(categories, formCategoryId).icon} ${getCategoryById(categories, formCategoryId).name}`
                : 'Chọn danh mục'}
            </button>

            {/* Frequency */}
            <div className="recurring-freq-options">
              {Object.entries(FREQ_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`recurring-freq-btn ${formFrequency === key ? 'active' : ''}`}
                  onClick={() => setFormFrequency(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Note */}
            <input className="input" type="text" placeholder="Ghi chú (tùy chọn)" value={formNote} onChange={(e) => setFormNote(e.target.value)} style={{ marginBottom: 16 }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={resetForm}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting || !parseVND(formAmount) || !formCategoryId}>
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryPicker && (
        <CategoryPicker
          type={formType}
          selectedId={formCategoryId}
          onSelect={(cat) => { setFormCategoryId(cat.id); setShowCategoryPicker(false) }}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa giao dịch định kỳ"
        message="Bạn có chắc chắn muốn xóa?"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
