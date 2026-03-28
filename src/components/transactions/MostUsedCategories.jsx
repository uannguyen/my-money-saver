import { useState } from 'react'
import { ChevronUp, ChevronDown, Pencil } from 'lucide-react'
import { getCategoryById } from '../../constants/categories'
import './MostUsedCategories.css'

/**
 * Collapsible "Most used" grid — 2 rows × 4 cols (7 items + Edit button).
 *
 * Props:
 *   mostUsed           - array of category objects (max 7)
 *   selectedCategoryId - currently selected categoryId
 *   onSelect(id)       - callback when a category is tapped
 *   onEdit()           - callback when "Edit" button is tapped
 *   categories         - flat category list for lookup
 */
export function MostUsedCategories({ mostUsed, selectedCategoryId, onSelect, onEdit, categories }) {
  const [expanded, setExpanded] = useState(false)

  if (!mostUsed?.length) return null

  return (
    <div className="most-used-wrapper">
      {/* Header */}
      <button
        type="button"
        className="most-used-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="most-used-title">Most used</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Grid */}
      {expanded && (
        <div className="most-used-grid">
          {mostUsed.slice(0, 7).map((cat) => {
            const isSelected = cat.id === selectedCategoryId
            return (
              <button
                key={cat.id}
                type="button"
                className={`most-used-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(cat.id)}
              >
                <span className="most-used-item-icon">{cat.icon}</span>
                <span className="most-used-item-name">{cat.name}</span>
              </button>
            )
          })}

          {/* Edit button */}
          <button
            type="button"
            className="most-used-item most-used-edit"
            onClick={onEdit}
          >
            <span className="most-used-item-icon most-used-edit-icon">
              <Pencil size={20} />
            </span>
            <span className="most-used-item-name">Edit</span>
          </button>
        </div>
      )}
    </div>
  )
}
