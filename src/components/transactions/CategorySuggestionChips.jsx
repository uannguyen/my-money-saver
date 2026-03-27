import { getCategoryById } from '../../constants/categories'
import './CategorySuggestionChips.css'

/**
 * Renders up to 3 quick-select category chips based on suggestion scores.
 *
 * @param {Array}  suggestions         - [{ categoryId, score }]
 * @param {string} selectedCategoryId  - currently selected categoryId
 * @param {Function} onSelect          - (categoryId) => void
 * @param {Array}  categories          - flat category list (allCats from useCategories)
 */
export function CategorySuggestionChips({ suggestions, selectedCategoryId, onSelect, categories }) {
  if (!suggestions?.length) return null

  return (
    <div className="suggestion-chips-wrapper">
      <span className="suggestion-chips-label">Gợi ý nhanh:</span>
      <div className="suggestion-chips-row">
        {suggestions.map(({ categoryId }) => {
          const cat = getCategoryById(categories, categoryId)
          if (!cat || cat.name === 'Không rõ') return null

          const isSelected = categoryId === selectedCategoryId
          return (
            <button
              key={categoryId}
              type="button"
              className={`suggestion-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(categoryId)}
            >
              <span className="suggestion-chip-icon">{cat.icon}</span>
              <span className="suggestion-chip-name">{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
