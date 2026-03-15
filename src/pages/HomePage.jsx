import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { Header } from '../components/layout/Header'
import { TransactionList } from '../components/transactions/TransactionList'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { formatVND } from '../utils/formatCurrency'
import { getMonthKey } from '../utils/dateHelpers'
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './HomePage.css'

export function HomePage() {
  const [monthKey, setMonthKey] = useState(getMonthKey(new Date()))
  const {
    transactions, loading, dailyGroups,
    totalIncome, totalExpense, balance,
    deleteTransaction,
  } = useTransactions(monthKey)
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState(null)

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
      <button className="fab" onClick={() => navigate('/add')} id="fab-add" aria-label="Thêm giao dịch">
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
