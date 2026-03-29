import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { SUB_IDS_BY_PARENT } from '../constants/categories'
import {
  getBudgetsByMonth,
  addBudget as addBdg,
  updateBudget as updateBdg,
  deleteBudget as deleteBdg,
} from '../services/budgetService'

export function useBudget(monthKey, expenseByCategory = {}) {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBudgets = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getBudgetsByMonth(user.uid, monthKey)
      setBudgets(data)
    } catch (err) {
      console.error('Failed to fetch budgets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, monthKey])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const addBudget = async (data) => {
    if (!user) return
    const result = await addBdg(user.uid, { ...data, month: monthKey })
    await fetchBudgets()
    return result
  }

  const updateBudget = async (id, data) => {
    if (!user) return
    const result = await updateBdg(user.uid, id, { ...data, month: monthKey })
    await fetchBudgets()
    return result
  }

  const deleteBudget = async (id) => {
    if (!user) return
    await deleteBdg(user.uid, id)
    await fetchBudgets()
  }

  // Enrich budgets with spent from expenseByCategory
  // If budget targets a parent category, aggregate all sub-category spending
  const budgetsWithSpent = budgets.map((b) => {
    const subIds = SUB_IDS_BY_PARENT.get(b.categoryId)
    const spent = subIds
      ? subIds.reduce((sum, sid) => sum + (expenseByCategory[sid] || 0), 0)
      : (expenseByCategory[b.categoryId] || 0)
    return {
      ...b,
      spent,
      remaining: b.amount - spent,
      percentage: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
    }
  })

  return {
    budgets: budgetsWithSpent,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  }
}
