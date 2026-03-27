import { getCategoryById } from '../../constants/categories'
import { formatVND } from '../../utils/formatCurrency'
import './BudgetCard.css'

export function BudgetCard({ budget, categories, onEdit, onDelete }) {
  const category = getCategoryById(categories, budget.categoryId)
  const pct = Math.min(budget.percentage, 100)
  const colorClass = budget.percentage >= 100 ? 'dark-red' : pct < 70 ? 'green' : pct < 90 ? 'yellow' : 'red'
  const alertIcon = budget.percentage >= 90 ? ' 🚨' : budget.percentage >= 70 ? ' ⚠️' : ''

  return (
    <div className="budget-card card animate-fade-in-up">
      <div className="budget-card-header">
        <div className="budget-card-left">
          <span className="budget-card-icon">{category.icon}</span>
          <span className="budget-card-name">{category.name}{alertIcon}</span>
        </div>
        <div className="budget-card-actions">
          <button className="btn btn-ghost budget-card-btn" onClick={() => onEdit?.(budget)}>
            ✏️
          </button>
          <button className="btn btn-ghost budget-card-btn" onClick={() => onDelete?.(budget)}>
            🗑️
          </button>
        </div>
      </div>

      <div className="progress-bar">
        <div className={`fill ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="budget-card-footer">
        <span className="budget-card-spent">
          {formatVND(budget.spent)} / {formatVND(budget.amount)}
        </span>
        <span className={`budget-card-remaining ${budget.remaining < 0 ? 'over' : ''}`}>
          {budget.remaining >= 0
            ? `Còn ${formatVND(budget.remaining)}`
            : `Vượt ${formatVND(Math.abs(budget.remaining))}`}
        </span>
      </div>
    </div>
  )
}
