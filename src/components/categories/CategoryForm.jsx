import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import './CategoryForm.css'

const ICONS = [
  '🍜', '🛵', '🛍️', '🏠', '🏥', '🎮', '📚', '👨‍👩‍👦', '🎉', '📦',
  '💼', '💻', '🎁', '🤝', '💰', '🛒', '🚗', '📱', '👕', '✈️',
  '🐶', '🎓', '🍔', '☕', '🍺', '⚽', '🎸', '🛠️', '💎', '🧾',
  '💸', '💳', '💵', '🪙', '📈', '🏦', '🎵', '📷', '🌿', '💊',
]

/**
 * CategoryForm - dùng cho cả Thêm mới và Chỉnh sửa
 * Props:
 *   type         - 'expense' | 'income'
 *   editingCat   - category đang sửa (null nếu thêm mới)
 *   onSave(data) - callback khi lưu thành công
 *   onClose()    - callback đóng modal
 */
export function CategoryForm({ type, editingCat, onSave, onClose }) {
  const isEditing = !!editingCat
  const [name, setName] = useState(editingCat?.name || '')
  const [icon, setIcon] = useState(editingCat?.icon || ICONS[0])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editingCat) {
      setName(editingCat.name)
      setIcon(editingCat.icon)
    }
  }, [editingCat])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      await onSave({ name: name.trim(), icon, type })
      toast.success(isEditing ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới')
      onClose()
    } catch (err) {
      toast.error('Lỗi: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const typeLabel = type === 'expense' ? 'chi tiêu' : 'thu nhập'

  return (
    <div className="category-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="category-modal">
        <div className="category-modal-header">
          <h3>{isEditing ? 'Chỉnh sửa' : 'Thêm'} danh mục {typeLabel}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          {/* Preview */}
          <div className="category-preview">
            <span className="category-preview-icon">{icon}</span>
            <span className="category-preview-name">{name || 'Tên danh mục'}</span>
          </div>

          <div className="category-form-section">
            <label>Tên danh mục</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cà phê, Internet..."
              maxLength={30}
              required
              autoFocus
            />
          </div>

          <div className="category-form-section">
            <label>Chọn biểu tượng</label>
            <div className="icon-grid">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`icon-btn ${icon === i ? 'selected' : ''}`}
                  onClick={() => setIcon(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="category-form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim() || submitting}>
              {submitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
