import { useState, useEffect } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useBudget } from '../hooks/useBudget'
import { useBudgetAlerts } from '../hooks/useBudgetAlerts'
import { useInsights } from '../hooks/useInsights'
import { useRecurring } from '../hooks/useRecurring'
import { Header } from '../components/layout/Header'
import { TransactionList } from '../components/transactions/TransactionList'
import { InsightCard } from '../components/common/InsightCard'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { formatVND } from '../utils/formatCurrency'
import { getMonthKey, prevMonth, formatDate } from '../utils/dateHelpers'
import { ALL_DEFAULT_CATEGORIES, getCategoryById } from '../constants/categories'

import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './HomePage.css'

export function HomePage() {
  const { user } = useAuth()
  const [monthKey, setMonthKey] = useState(getMonthKey(new Date()))
  const {
    transactions, loading, dailyGroups,
    totalIncome, totalExpense, balance,
    deleteTransaction, expenseByCategory, refetch,
  } = useTransactions(monthKey)
  const { transactions: prevTransactions } = useTransactions(prevMonth(monthKey))
  const { budgets } = useBudget(monthKey, expenseByCategory)
  const { showDailyToast } = useBudgetAlerts(budgets, ALL_DEFAULT_CATEGORIES)
  const { insights } = useInsights(transactions, prevTransactions, budgets, ALL_DEFAULT_CATEGORIES)
  const { upcoming3Days } = useRecurring()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (budgets.length > 0) {
      showDailyToast()
    }
  }, [budgets.length, showDailyToast])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteTransaction(deleteTarget.id)
      toast.success('Đã xóa giao dịch')
    } catch {
      toast.error('Xóa thất bại')
    }
    setDeleteTarget(null)
  }


  return (
    <div className="page-container" id="home-page">
      <Header monthKey={monthKey} onMonthChange={setMonthKey} />

      {/* Summary Cards */}
      <div className="summary-cards animate-fade-in-up">
        <div className="summary-card income">
          <span className="summary-label">Thu nhập</span>
          <span className="summary-amount">{formatVND(totalIncome)}</span>
        </div>
        <div className="summary-card expense">
          <span className="summary-label">Chi tiêu</span>
          <span className="summary-amount">{formatVND(totalExpense)}</span>
        </div>
        <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <span className="summary-label">Số dư</span>
          <span className="summary-amount">{formatVND(balance)}</span>
        </div>
      </div>

      {/* Insights */}
      <InsightCard insights={insights} />

      {/* Upcoming Recurring Transactions */}
      {upcoming3Days.length > 0 && (
        <div className="card upcoming-banner animate-fade-in-up" style={{ marginBottom: 16, padding: '12px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 8 }}>🔔 Sắp tới</div>
          {upcoming3Days.map((r) => {
            const cat = getCategoryById(ALL_DEFAULT_CATEGORIES, r.categoryId)
            return (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.8125rem' }}>
                <span>{cat.icon} {cat.name}</span>
                <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{formatDate(r.nextDueDate)}</span>
                  <span style={{ fontWeight: 600, color: r.type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)' }}>
                    {r.type === 'expense' ? '-' : '+'}{formatVND(r.amount)}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Transaction List */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : (
        <TransactionList
          dailyGroups={dailyGroups}
          categories={ALL_DEFAULT_CATEGORIES}
          onEdit={(txn) => navigate(`/edit/${txn.id}`, { state: { transaction: txn } })}
          onDelete={setDeleteTarget}
        />
      )}

      {/* FAB */}
      <button
        className="fab"
        id="fab-add"
        aria-label="Thêm giao dịch"
        onClick={() => navigate('/add')}
      >
        +
      </button>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa giao dịch"
        message="Bạn có chắc chắn muốn xóa giao dịch này?"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
