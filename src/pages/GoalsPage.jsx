import { useState } from 'react'
import toast from 'react-hot-toast'
import { Header } from '../components/layout/Header'
import { GoalCard } from '../components/goals/GoalCard'
import { GoalForm } from '../components/goals/GoalForm'
import { DepositSheet } from '../components/goals/DepositSheet'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { PrivacyAmount } from '../components/privacy/PrivacyAmount'
import './GoalsPage.css'

export function GoalsPage() {
  const {
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    addMovement,
    totalSaved,
    monthlyContribution,
    projected12Months,
    activeGoals,
  } = useSavingsGoals()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [movementTarget, setMovementTarget] = useState(null)

  const openAdd = () => {
    setEditTarget(null)
    setShowForm(true)
  }

  const openEdit = (goal) => {
    setEditTarget(goal)
    setShowForm(true)
  }

  const handleSave = async (data) => {
    try {
      if (editTarget) {
        await updateGoal(editTarget.id, data)
        toast.success('Đã cập nhật khoản tiết kiệm')
      } else {
        await addGoal(data)
        toast.success('Đã thêm khoản tiết kiệm')
      }
    } catch (err) {
      toast.error('Lưu thất bại')
      throw err
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteGoal(deleteTarget.id)
      toast.success('Đã xóa khoản tiết kiệm')
    } catch {
      toast.error('Xóa thất bại')
    }
    setDeleteTarget(null)
  }

  const openMovement = (goal, type) => {
    setMovementTarget({ goal, type })
  }

  const handleMovement = async (goalId, data) => {
    try {
      const result = await addMovement(goalId, data)
      const messages = {
        deposit: 'Đã thêm tiền',
        withdraw: 'Đã rút tiền',
      }
      toast.success(messages[data.type] || 'Đã cập nhật khoản tiết kiệm')
      return result
    } catch (err) {
      toast.error('Cập nhật khoản tiết kiệm thất bại')
      throw err
    }
  }

  return (
    <div className="page-container" id="goals-page">
      <Header title="Tiết kiệm" />

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Summary */}
          {activeGoals.length > 0 && (
            <div className="goals-summary card">
              <div className="goals-summary-item">
                <span className="goals-summary-label">Hiện có</span>
                <PrivacyAmount amount={totalSaved} className="goals-summary-value" />
              </div>
              <div className="goals-summary-item">
                <span className="goals-summary-label">Góp/tháng</span>
                <PrivacyAmount amount={monthlyContribution} className="goals-summary-value" />
              </div>
              <div className="goals-summary-item">
                <span className="goals-summary-label">Sau 12 tháng</span>
                <PrivacyAmount amount={projected12Months} className="goals-summary-value" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {activeGoals.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🎯</div>
              <div className="title">Chưa có khoản tiết kiệm</div>
              <div className="desc">Tạo khoản tiết kiệm để theo dõi số tiền bạn đang để dành</div>
            </div>
          ) : (
            <div className="goals-list">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onMovement={openMovement}
                />
              ))}
            </div>
          )}

          {/* FAB */}
          <button className="goals-fab" onClick={openAdd}>
            +
          </button>
        </>
      )}

      {/* Goal Form */}
      {showForm && (
        <GoalForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Deposit Sheet */}
      {movementTarget && (
        <DepositSheet
          goal={movementTarget.goal}
          initialType={movementTarget.type}
          onMovement={handleMovement}
          onClose={() => setMovementTarget(null)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa khoản tiết kiệm"
        message="Bạn có chắc chắn muốn xóa khoản tiết kiệm này?"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
