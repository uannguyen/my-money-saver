import { useState } from 'react'
import toast from 'react-hot-toast'
import { Header } from '../components/layout/Header'
import { GoalCard } from '../components/goals/GoalCard'
import { GoalForm } from '../components/goals/GoalForm'
import { DepositSheet } from '../components/goals/DepositSheet'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { formatVND } from '../utils/formatCurrency'
import './GoalsPage.css'

export function GoalsPage() {
  const {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    deposit,
    totalSaved,
    activeGoals,
  } = useSavingsGoals()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [depositTarget, setDepositTarget] = useState(null)

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
        toast.success('Đã cập nhật mục tiêu')
      } else {
        await addGoal(data)
        toast.success('Đã thêm mục tiêu')
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
      toast.success('Đã xóa mục tiêu')
    } catch {
      toast.error('Xóa thất bại')
    }
    setDeleteTarget(null)
  }

  const handleDeposit = async (goalId, amount, note) => {
    try {
      const result = await deposit(goalId, amount, note)
      if (result?.isCompleted) {
        toast.success('Chúc mừng! Bạn đã hoàn thành mục tiêu! 🎉')
      } else {
        toast.success('Đã nạp tiền thành công')
      }
      return result
    } catch (err) {
      toast.error('Nạp tiền thất bại')
      throw err
    }
  }

  return (
    <div className="page-container" id="goals-page">
      <Header title="Mục tiêu tiết kiệm" />

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Summary */}
          {goals.length > 0 && (
            <div className="goals-summary card">
              <div className="goals-summary-item">
                <span className="goals-summary-label">Tổng tiết kiệm</span>
                <span className="goals-summary-value">{formatVND(totalSaved)}</span>
              </div>
              <div className="goals-summary-item">
                <span className="goals-summary-label">Đang thực hiện</span>
                <span className="goals-summary-value">{activeGoals.length} mục tiêu</span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {goals.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🎯</div>
              <div className="title">Chưa có mục tiêu</div>
              <div className="desc">Đặt mục tiêu để bắt đầu tiết kiệm</div>
            </div>
          ) : (
            <div className="goals-list">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onDeposit={setDepositTarget}
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
      {depositTarget && (
        <DepositSheet
          goal={depositTarget}
          onDeposit={handleDeposit}
          onClose={() => setDepositTarget(null)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa mục tiêu"
        message="Bạn có chắc chắn muốn xóa mục tiêu này?"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
