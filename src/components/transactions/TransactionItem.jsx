import { formatVND } from '../../utils/formatCurrency'
import { getCategoryById } from '../../constants/categories'
import './TransactionItem.css'

export function TransactionItem({ transaction, categories, onEdit, onDelete }) {
  const category = getCategoryById(categories, transaction.categoryId)
  const isExpense = transaction.type === 'expense'

  return (
    <div className="txn-item animate-fade-in-up" onClick={() => onEdit?.(transaction)}>
      <div className="txn-item-left">
        <span className="txn-item-icon">{category.icon}</span>
        <div className="txn-item-info">
          <span className="txn-item-category">{category.name}</span>
          {transaction.note && (
            <span className="txn-item-note">{transaction.note}</span>
          )}
        </div>
      </div>
      <div className="txn-item-right">
        <span className={`txn-item-amount ${isExpense ? 'expense' : 'income'}`}>
          {isExpense ? '-' : '+'}{formatVND(transaction.amount)}
        </span>
        <button
          className="txn-item-delete"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(transaction)
          }}
          aria-label="Xóa"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
