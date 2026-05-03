import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getSavingsGoals,
  addSavingsGoal as addGoalSvc,
  updateSavingsGoal as updateGoalSvc,
  deleteSavingsGoal as deleteGoalSvc,
  depositToGoal as depositSvc,
  addSavingsMovement as addMovementSvc,
} from '../services/savingsService'

export function useSavingsGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGoals = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getSavingsGoals(user.uid)
      setGoals(data)
    } catch (err) {
      console.error('Failed to fetch savings goals:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const addGoal = async (data) => {
    if (!user) return
    const result = await addGoalSvc(user.uid, data)
    await fetchGoals()
    return result
  }

  const updateGoal = async (id, data) => {
    if (!user) return
    const result = await updateGoalSvc(user.uid, id, data)
    await fetchGoals()
    return result
  }

  const deleteGoal = async (id) => {
    if (!user) return
    await deleteGoalSvc(user.uid, id)
    await fetchGoals()
  }

  const deposit = async (goalId, amount, note) => {
    if (!user) return
    const result = await depositSvc(user.uid, goalId, amount, note)
    await fetchGoals()
    return result
  }

  const addMovement = async (goalId, data) => {
    if (!user) return
    const result = await addMovementSvc(user.uid, goalId, data)
    await fetchGoals()
    return result
  }

  // Computed values
  const activeGoals = goals.filter((g) => !g.isArchived)
  const totalSaved = activeGoals.reduce((sum, g) => sum + (g.balance || 0), 0)
  const monthlyContribution = activeGoals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0)
  const projected12Months = activeGoals.reduce((sum, g) => {
    const rateGrowth = (g.balance || 0) * ((g.expectedReturnRate || 0) / 100)
    return sum + (g.balance || 0) + ((g.monthlyContribution || 0) * 12) + rateGrowth
  }, 0)

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    deposit,
    addMovement,
    totalSaved,
    monthlyContribution,
    projected12Months,
    activeGoals,
    refetch: fetchGoals,
  }
}
