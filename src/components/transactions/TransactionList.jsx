import { TransactionItem } from './TransactionItem'
import { formatDayLabel } from '../../utils/dateHelpers'
import { formatVND } from '../../utils/formatCurrency'
import './TransactionList.css'

export function TransactionList({ dailyGroups, categories, onEdit, onDelete }) {
  if (!dailyGroups || dailyGroups.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📝</div>
        <div className="title">Chưa có giao dịch</div>
        <div className="desc">Nhấn nút + để thêm giao dịch đầu tiên</div>
      </div>
    )
  }

  return (
    <div className="txn-list">
      {dailyGroups.map((group) => (
        <div key={group.dateKey} className="txn-day-group animate-fade-in-up">
          <div className="txn-day-header">
            <span className="txn-day-label">{formatDayLabel(group.date)}</span>
            <span className={`txn-day-total ${group.total >= 0 ? 'income' : 'expense'}`}>
              {group.total >= 0 ? '+' : ''}{formatVND(group.total)}
            </span>
          </div>
          <div className="txn-day-items card">
            {group.transactions.map((txn) => (
              <TransactionItem
                key={txn.id}
                transaction={txn}
                categories={categories}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
