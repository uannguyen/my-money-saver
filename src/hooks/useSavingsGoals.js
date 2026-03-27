import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getSavingsGoals,
  addSavingsGoal as addGoalSvc,
  updateSavingsGoal as updateGoalSvc,
  deleteSavingsGoal as deleteGoalSvc,
  depositToGoal as depositSvc,
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

  // Computed values
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const activeGoals = goals.filter((g) => !g.isCompleted)

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    deposit,
    totalSaved,
    activeGoals,
    refetch: fetchGoals,
  }
}
