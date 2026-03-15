import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { addCustomCategory } from '../../services/categoryService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import './CategoryForm.css'

const ICONS = [
  '🛒', '🚗', '🏠', '📱', '👕', '🏥', '🎉', '✈️', '🎁', '🐶',
  '🎓', '💼', '💡', '🍔', '☕', '🍺', '⚽', '🎸', '🎮', '🛠️',
  '💰', '📈', '🏦', '💎', '🏅', '🧾', '💸', '💳', '💵', '🪙'
]

export function CategoryForm({ type, onAdded, onClose }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      await addCustomCategory(user.uid, {
        name: name.trim(),
        icon,
        type
      })
      toast.success('Đã thêm danh mục mới')
      onAdded()
      onClose()
    } catch (err) {
      toast.error('Lỗi khi thêm danh mục: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="category-modal-overlay">
      <div className="category-modal">
        <div className="category-modal-header">
          <h3>Thêm danh mục {type === 'expense' ? 'chi tiêu' : 'thu nhập'}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="category-form">
          <div className="category-form-section">
            <label>Tên danh mục</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Tiền điện thoại..."
              maxLength={30}
              required
              autoFocus
            />
          </div>

          <div className="category-form-section">
            <label>Chọn biểu tượng</label>
            <div className="icon-grid">
              {ICONS.map(i => (
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
              {submitting ? 'Đang lưu...' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
