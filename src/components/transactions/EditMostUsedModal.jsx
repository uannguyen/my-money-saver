import { useState, useMemo } from 'react'
import { ArrowLeft, Check, Search, Star, X } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import './EditMostUsedModal.css'

/**
 * Full-screen modal to edit pinned "Most Used" categories.
 *
 * Props:
 *   pinnedIds       - current array of pinned category IDs
 *   onSave(ids)     - callback with updated array
 *   onClose()       - close modal
 */
export function EditMostUsedModal({ pinnedIds: initialPinnedIds, onSave, onClose }) {
  const { parents } = useCategories()
  const [pinnedIds, setPinnedIds] = useState(initialPinnedIds || [])
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState(() => new Set(parents.map((p) => p.id)))

  // Filter parents for expense type only (most common use case)
  const filteredParents = useMemo(() => {
    const allParents = parents.filter((p) => p.type === 'expense')

    if (!search.trim()) return allParents

    const q = search.trim().toLowerCase()
    return allParents
      .map((p) => {
        const matchingSubs = p.subs.filter((s) => s.name.toLowerCase().includes(q))
        const parentMatches = p.name.toLowerCase().includes(q)
        if (parentMatches) return p
        if (matchingSubs.length > 0) return { ...p, subs: matchingSubs }
        return null
      })
      .filter(Boolean)
  }, [parents, search])

  // Auto-expand when searching
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

  const togglePin = (subId) => {
    setPinnedIds((prev) => {
      if (prev.includes(subId)) {
        return prev.filter((id) => id !== subId)
      }
      return [...prev, subId]
    })
  }

  const isPinned = (subId) => pinnedIds.includes(subId)

  // Resolve pinned items for preview — supports both parent-level and sub-level IDs
  const allSubs = parents.flatMap((p) =>
    p.subs.map((s) => ({ ...s, type: p.type, parentId: p.id, parentName: p.name }))
  )
  const pinnedItems = pinnedIds
    .map((id) => allSubs.find((s) => s.id === id) || parents.find((p) => p.id === id))
    .filter(Boolean)

  const handleSave = () => {
    onSave(pinnedIds)
    onClose()
  }

  return (
    <div className="edit-mu-overlay">
      <div className="edit-mu-modal">
        {/* Header */}
        <div className="edit-mu-header">
          <button type="button" className="edit-mu-back" onClick={onClose}>
            <ArrowLeft size={20} />
          </button>
          <h3 className="edit-mu-title">Edit most used categories</h3>
          <button type="button" className="edit-mu-save-icon" onClick={handleSave}>
            <Check size={20} />
          </button>
        </div>

        {/* Pinned preview */}
        {pinnedItems.length > 0 && (
          <div className="edit-mu-pinned-section">
            <span className="edit-mu-pinned-label">MOST USED ({pinnedItems.length})</span>
            <div className="edit-mu-pinned-scroll">
              {pinnedItems.map((cat) => (
                <div key={cat.id} className="edit-mu-pinned-item">
                  <span className="edit-mu-pinned-icon">{cat.icon}</span>
                  <Star size={12} className="edit-mu-pinned-star" fill="currentColor" />
                  <span className="edit-mu-pinned-name">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="edit-mu-search">
          <Search size={16} className="edit-mu-search-icon" />
          <input
            type="text"
            placeholder="Search by category name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="edit-mu-search-input"
          />
        </div>

        {/* Category list */}
        <div className="edit-mu-list">
          {filteredParents.length === 0 && (
            <div className="edit-mu-empty">Không tìm thấy danh mục</div>
          )}

          {filteredParents.map((parent) => {
            const isExpanded = effectiveExpanded.has(parent.id)

            return (
              <div key={parent.id} className="edit-mu-group">
                {/* Parent row: chevron toggles expand, Star pins parent */}
                <div className={`edit-mu-parent ${isExpanded ? 'expanded' : ''}`}>
                  <button
                    type="button"
                    className="edit-mu-parent-expand"
                    onClick={() => toggleExpand(parent.id)}
                  >
                    <span className="edit-mu-chevron">{isExpanded ? '⌃' : '⌄'}</span>
                    <span className="edit-mu-parent-icon">{parent.icon}</span>
                    <span className="edit-mu-parent-name">{parent.name}</span>
                  </button>
                  <button
                    type="button"
                    className="edit-mu-parent-pin"
                    onClick={() => togglePin(parent.id)}
                  >
                    <Star
                      size={18}
                      className={`edit-mu-star ${isPinned(parent.id) ? 'active' : 'muted'}`}
                      fill={isPinned(parent.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                {/* Sub rows */}
                {isExpanded && (
                  <div className="edit-mu-subs">
                    {parent.subs.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        className={`edit-mu-sub ${isPinned(sub.id) ? 'pinned' : ''}`}
                        onClick={() => togglePin(sub.id)}
                      >
                        <span className="edit-mu-sub-icon">{sub.icon}</span>
                        <span className="edit-mu-sub-name">{sub.name}</span>
                        <Star
                          size={18}
                          className={`edit-mu-star ${isPinned(sub.id) ? 'active' : ''}`}
                          fill={isPinned(sub.id) ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Save button */}
        <div className="edit-mu-footer">
          <button type="button" className="btn btn-primary edit-mu-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
