import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { useCategories } from '../hooks/useCategories'
import { addTransaction, updateTransaction } from '../services/transactionService'
import { addRecurring, computeNextDueDate } from '../services/recurringService'
import toast from 'react-hot-toast'
import './AddPage.css'

export function AddPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { categories, fetchCategories } = useCategories()
  const editTxn = location.state?.transaction || null

  const handleSubmit = async (data) => {
    try {
      if (editTxn) {
        await updateTransaction(user.uid, editTxn.id, data)
        toast.success('Đã cập nhật giao dịch')
      } else {
        await addTransaction(user.uid, data)

        // Create recurring rule if enabled
        if (data.isRecurring && data.frequency) {
          const startDate = new Date(data.date)
          await addRecurring(user.uid, {
            type: data.type,
            amount: data.amount,
            categoryId: data.categoryId,
            note: data.note,
            frequency: data.frequency,
            startDate,
            nextDueDate: computeNextDueDate(startDate, data.frequency),
            isActive: true,
          })
          toast.success('Đã thêm giao dịch + lặp lại')
        } else {
          toast.success('Đã thêm giao dịch')
        }
      }
      navigate('/', { replace: true })
    } catch (err) {
      toast.error('Lưu thất bại: ' + err.message)
    }
  }

  return (
    <div className="page-container" id="add-page">
      <div className="add-page-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <h2 className="add-page-title">
          {editTxn ? 'Sửa giao dịch' : 'Thêm giao dịch'}
        </h2>
      </div>

      <div className="card add-page-form">
        <TransactionForm
          initial={editTxn}
          categories={categories}
          onCategoryAdded={fetchCategories}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  )
}
