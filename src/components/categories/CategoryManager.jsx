import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { CategoryForm } from './CategoryForm'
import { ALL_DEFAULT_CATEGORIES } from '../../constants/categories'
import toast from 'react-hot-toast'
import './CategoryManager.css'

const DEFAULT_IDS = new Set(ALL_DEFAULT_CATEGORIES.map((c) => c.id))

export function CategoryManager() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories()
  const [formState, setFormState] = useState(null) // { type, editingCat }
  const [deletingId, setDeletingId] = useState(null)
  const [activeTab, setActiveTab] = useState('expense')

  const filteredCats = categories.filter((c) => c.type === activeTab)

  const openAdd = () => setFormState({ type: activeTab, editingCat: null })
  const openEdit = (cat) => setFormState({ type: cat.type, editingCat: cat })
  const closeForm = () => setFormState(null)

  const handleSave = async (data) => {
    if (formState.editingCat) {
      await updateCategory(formState.editingCat.id, data)
    } else {
      await addCategory(data)
    }
  }

  const handleDelete = async (cat) => {
    if (DEFAULT_IDS.has(cat.id)) {
      toast.error('Không thể xóa danh mục mặc định')
      return
    }
    setDeletingId(cat.id)
    try {
      await deleteCategory(cat.id)
      toast.success(`Đã xóa "${cat.name}"`)
    } catch (err) {
      toast.error('Lỗi khi xóa: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="cat-manager">
      {/* Tabs */}
      <div className="cat-manager-tabs">
        <button
          className={`cat-tab ${activeTab === 'expense' ? 'active expense' : ''}`}
          onClick={() => setActiveTab('expense')}
        >
          Chi tiêu
        </button>
        <button
          className={`cat-tab ${activeTab === 'income' ? 'active income' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Thu nhập
        </button>
      </div>

      {/* Category List */}
      {loading ? (
        <div className="cat-loading">
          <div className="spinner" />
        </div>
      ) : (
        <div className="cat-list">
          {filteredCats.map((cat) => {
            const isDefault = DEFAULT_IDS.has(cat.id)
            return (
              <div key={cat.id} className="cat-row">
                <div className="cat-row-info">
                  <span className="cat-row-icon">{cat.icon}</span>
                  <span className="cat-row-name">{cat.name}</span>
                  {isDefault && <span className="cat-badge">Mặc định</span>}
                </div>
                <div className="cat-row-actions">
                  <button
                    className="cat-action-btn edit"
                    onClick={() => openEdit(cat)}
                    title="Chỉnh sửa"
                  >
                    <Pencil size={15} />
                  </button>
                  {!isDefault && (
                    <button
                      className="cat-action-btn delete"
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Button */}
      <button className="cat-add-btn" onClick={openAdd}>
        <Plus size={16} />
        Thêm danh mục {activeTab === 'expense' ? 'chi tiêu' : 'thu nhập'}
      </button>

      {/* Form Modal */}
      {formState && (
        <CategoryForm
          type={formState.type}
          editingCat={formState.editingCat}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </div>
  )
}
