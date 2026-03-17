import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, X, Search } from 'lucide-react'
import { ALL_DEFAULT_PARENTS } from '../../constants/categories'
import { useCategories } from '../../hooks/useCategories'
import './CategoryPicker.css'

/**
 * Full-screen category picker modal.
 * Shows parent categories with expandable sub-category lists.
 *
 * Props:
 *   type          - 'expense' | 'income'
 *   selectedId    - currently selected sub-category ID
 *   onSelect(sub) - callback with the selected sub-category object
 *   onClose()     - close the picker
 */
export function CategoryPicker({ type, selectedId, onSelect, onClose }) {
  const { parents } = useCategories()
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [search, setSearch] = useState('')

  const filteredParents = useMemo(() => {
    const typeParents = parents.filter((p) => p.type === type)

    if (!search.trim()) return typeParents

    const q = search.trim().toLowerCase()
    return typeParents
      .map((p) => {
        const matchingSubs = p.subs.filter((s) => s.name.toLowerCase().includes(q))
        const parentMatches = p.name.toLowerCase().includes(q)
        if (parentMatches) return p // show all subs if parent matches
        if (matchingSubs.length > 0) return { ...p, subs: matchingSubs }
        return null
      })
      .filter(Boolean)
  }, [parents, type, search])

  // Auto-expand all when searching
  const effectiveExpanded = search.trim()
    ? new Set(filteredParents.map((p) => p.id))
    : expandedIds

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelect = (parent, sub) => {
    onSelect({ ...sub, type: parent.type, parentId: parent.id, parentName: parent.name })
  }

  return (
    <div className="cpicker-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cpicker-modal">
        {/* Header */}
        <div className="cpicker-header">
          <button className="cpicker-close" onClick={onClose}>
            <X size={20} />
          </button>
          <h3 className="cpicker-title">Chọn danh mục</h3>
        </div>

        {/* Search */}
        <div className="cpicker-search">
          <Search size={16} className="cpicker-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cpicker-search-input"
          />
        </div>

        {/* List */}
        <div className="cpicker-list">
          {filteredParents.length === 0 && (
            <div className="cpicker-empty">Không tìm thấy danh mục</div>
          )}

          {filteredParents.map((parent) => {
            const isExpanded = effectiveExpanded.has(parent.id)

            return (
              <div key={parent.id} className="cpicker-group">
                {/* Parent row */}
                <button
                  className={`cpicker-parent ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(parent.id)}
                >
                  <span className="cpicker-chevron">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <span className="cpicker-parent-icon">{parent.icon}</span>
                  <span className="cpicker-parent-name">{parent.name}</span>
                  <span className="cpicker-parent-count">{parent.subs.length}</span>
                </button>

                {/* Sub rows */}
                {isExpanded && (
                  <div className="cpicker-subs">
                    {parent.subs.map((sub) => (
                      <button
                        key={sub.id}
                        className={`cpicker-sub ${selectedId === sub.id ? 'active' : ''}`}
                        onClick={() => handleSelect(parent, sub)}
                      >
                        <span className="cpicker-sub-icon">{sub.icon}</span>
                        <span className="cpicker-sub-name">{sub.name}</span>
                        {selectedId === sub.id && <span className="cpicker-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
