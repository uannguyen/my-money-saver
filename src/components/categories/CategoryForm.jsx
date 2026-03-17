import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import './CategoryForm.css'

/**
 * CategoryForm
 * Props:
 *   mode       - 'parent' (add/edit top-level) | 'sub' (add sub under parent)
 *   type       - 'expense' | 'income'
 *   editingCat - category being edited (null for add)
 *   onSave(data) - callback
 *   onClose()    - callback
 */
export function CategoryForm({ mode, type, editingCat, onSave, onClose }) {
  const isEditing = !!editingCat
  const isSub = mode === 'sub'

  const [name, setName] = useState(editingCat?.name || '')
  const [icon, setIcon] = useState(editingCat?.icon || '📦')
  const [showPicker, setShowPicker] = useState(false)
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
  const title = isEditing
    ? 'Chỉnh sửa danh mục'
    : isSub
    ? `Thêm danh mục phụ`
    : `Thêm danh mục ${typeLabel}`

  return (
    <div className="category-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="category-modal">
        <div className="category-modal-header">
          <h3>{title}</h3>
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
              placeholder={isSub ? 'VD: Ăn ngoài tiệm, Grab...' : 'VD: Ăn uống, Đi lại...'}
              maxLength={30}
              required
              autoFocus
            />
          </div>

          <div className="category-form-section">
            <label>Chọn biểu tượng</label>
            <div className="icon-selector-wrapper">
              <button
                type="button"
                className="icon-selector-btn"
                onClick={() => setShowPicker(!showPicker)}
              >
                {icon}
              </button>
              {showPicker && (
                <div className="emoji-picker-container">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setIcon(emojiData.emoji)
                      setShowPicker(false)
                    }}
                    theme={Theme.AUTO}
                    searchPlaceHolder="Tìm kiếm biểu tượng..."
                    width="100%"
                    height={350}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="category-form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim() || submitting}>
              {submitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
