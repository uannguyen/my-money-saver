import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { CategoryForm } from './CategoryForm'
import { DEFAULT_PARENT_IDS, DEFAULT_SUB_IDS } from '../../constants/categories'
import toast from 'react-hot-toast'
import './CategoryManager.css'

export function CategoryManager() {
  const {
    parents,
    loading,
    addParent,
    updateParent,
    deleteParent,
    addSubCategory,
    deleteSubCategory,
  } = useCategories()

  const [activeTab, setActiveTab] = useState('expense')
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [formState, setFormState] = useState(null) // { mode, type, parentId?, editingCat? }
  const [deletingId, setDeletingId] = useState(null)

  const filteredParents = parents.filter((p) => p.type === activeTab)

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ─── Open form helpers ───────────────────────────────────────────────────────
  const openAddParent = () =>
    setFormState({ mode: 'parent', type: activeTab, editingCat: null })

  const openEditParent = (parent) =>
    setFormState({ mode: 'parent', type: parent.type, editingCat: parent })

  const openAddSub = (parent) =>
    setFormState({ mode: 'sub', type: parent.type, parentId: parent.id, editingCat: null })

  const closeForm = () => setFormState(null)

  // ─── Save from form ──────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    if (formState.mode === 'parent') {
      if (formState.editingCat) {
        await updateParent(formState.editingCat.id, data)
      } else {
        await addParent(data)
      }
    } else {
      // sub
      await addSubCategory(formState.parentId, data)
      // auto-expand the parent
      setExpandedIds((prev) => new Set([...prev, formState.parentId]))
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteParent = async (parent) => {
    if (DEFAULT_PARENT_IDS.has(parent.id)) {
      toast.error('Không thể xóa danh mục mặc định')
      return
    }
    setDeletingId(parent.id)
    try {
      await deleteParent(parent.id)
      toast.success(`Đã xóa "${parent.name}"`)
    } catch (err) {
      toast.error('Lỗi: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteSub = async (parent, sub) => {
    if (DEFAULT_SUB_IDS.has(sub.id)) {
      toast.error('Không thể xóa danh mục phụ mặc định')
      return
    }
    setDeletingId(sub.id)
    try {
      await deleteSubCategory(parent.id, sub)
      toast.success(`Đã xóa "${sub.name}"`)
    } catch (err) {
      toast.error('Lỗi: ' + err.message)
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

      {/* List */}
      {loading ? (
        <div className="cat-loading">
          <div className="spinner" />
        </div>
      ) : (
        <div className="cat-list">
          {filteredParents.map((parent) => {
            const isDefaultParent = DEFAULT_PARENT_IDS.has(parent.id)
            const isExpanded = expandedIds.has(parent.id)

            return (
              <div key={parent.id} className="cat-group">
                {/* Parent Row */}
                <div className={`cat-parent-row ${isExpanded ? 'expanded' : ''}`}>
                  <button
                    className="cat-expand-btn"
                    onClick={() => toggleExpand(parent.id)}
                    title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                  >
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>

                  <div className="cat-row-info" onClick={() => toggleExpand(parent.id)}>
                    <span className="cat-row-icon">{parent.icon}</span>
                    <span className="cat-row-name">{parent.name}</span>
                    {isDefaultParent && <span className="cat-badge">Mặc định</span>}
                    <span className="cat-sub-count">{parent.subs.length} mục</span>
                  </div>

                  <div className="cat-row-actions">
                    <button
                      className="cat-action-btn edit"
                      onClick={() => openEditParent(parent)}
                      title="Chỉnh sửa"
                    >
                      <Pencil size={14} />
                    </button>
                    {!isDefaultParent && (
                      <button
                        className="cat-action-btn delete"
                        onClick={() => handleDeleteParent(parent)}
                        disabled={deletingId === parent.id}
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-category rows */}
                {isExpanded && (
                  <div className="cat-subs">
                    {parent.subs.map((sub) => {
                      const isDefaultSub = DEFAULT_SUB_IDS.has(sub.id)
                      return (
                        <div key={sub.id} className="cat-sub-row">
                          <div className="cat-row-info">
                            <span className="cat-sub-icon">{sub.icon}</span>
                            <span className="cat-sub-name">{sub.name}</span>
                            {isDefaultSub && <span className="cat-badge">Mặc định</span>}
                          </div>
                          <div className="cat-row-actions">
                            {!isDefaultSub && (
                              <button
                                className="cat-action-btn delete"
                                onClick={() => handleDeleteSub(parent, sub)}
                                disabled={deletingId === sub.id}
                                title="Xóa"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Add sub button */}
                    <button
                      className="cat-add-sub-btn"
                      onClick={() => openAddSub(parent)}
                    >
                      <Plus size={13} />
                      Thêm danh mục phụ
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Parent Button */}
      <button className="cat-add-btn" onClick={openAddParent}>
        <Plus size={16} />
        Thêm danh mục {activeTab === 'expense' ? 'chi tiêu' : 'thu nhập'}
      </button>

      {/* Form Modal */}
      {formState && (
        <CategoryForm
          mode={formState.mode}
          type={formState.type}
          editingCat={formState.editingCat}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </div>
  )
}
