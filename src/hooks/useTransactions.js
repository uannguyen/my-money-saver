import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getTransactionsByMonth,
  addTransaction as addTxn,
  updateTransaction as updateTxn,
  deleteTransaction as deleteTxn,
} from '../services/transactionService'

export function useTransactions(monthKey) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getTransactionsByMonth(user.uid, monthKey)
      setTransactions(data)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, monthKey])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (data) => {
    if (!user) return
    const result = await addTxn(user.uid, data)
    await fetchTransactions()
    return result
  }

  const updateTransaction = async (id, data) => {
    if (!user) return
    const result = await updateTxn(user.uid, id, data)
    await fetchTransactions()
    return result
  }

  const deleteTransaction = async (id) => {
    if (!user) return
    await deleteTxn(user.uid, id)
    await fetchTransactions()
  }

  // Computed values
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Group by day
  const groupedByDay = transactions.reduce((groups, txn) => {
    const dateKey = txn.date.toISOString().split('T')[0]
    if (!groups[dateKey]) {
      groups[dateKey] = { date: txn.date, transactions: [], total: 0 }
    }
    groups[dateKey].transactions.push(txn)
    groups[dateKey].total +=
      txn.type === 'expense' ? -txn.amount : txn.amount
    return groups
  }, {})

  const dailyGroups = Object.entries(groupedByDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, val]) => ({ dateKey: key, ...val }))

  // Expense by category
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount
      return acc
    }, {})

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
    totalIncome,
    totalExpense,
    balance,
    dailyGroups,
    expenseByCategory,
  }
}
