import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getRecurrings,
  addRecurring as addRec,
  updateRecurring as updateRec,
  deleteRecurring as deleteRec,
  computeNextDueDate,
} from '../services/recurringService'
import { addTransaction } from '../services/transactionService'

export function useRecurring() {
  const { user } = useAuth()
  const [recurrings, setRecurrings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecurrings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getRecurrings(user.uid)
      setRecurrings(data)
    } catch (err) {
      console.error('Failed to fetch recurrings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchRecurrings()
  }, [fetchRecurrings])

  const addRecurring = async (data) => {
    if (!user) return
    const result = await addRec(user.uid, data)
    await fetchRecurrings()
    return result
  }

  const updateRecurring = async (id, data) => {
    if (!user) return
    const result = await updateRec(user.uid, id, data)
    await fetchRecurrings()
    return result
  }

  const deleteRecurring = async (id) => {
    if (!user) return
    await deleteRec(user.uid, id)
    await fetchRecurrings()
  }

  const toggleActive = async (id, isActive) => {
    return updateRecurring(id, { isActive })
  }

  const processDueRecurrings = useCallback(async () => {
    if (!user) return 0
    const now = new Date()
    const due = recurrings.filter((r) => r.isActive && r.nextDueDate && r.nextDueDate <= now)
    let count = 0

    for (const r of due) {
      try {
        await addTransaction(user.uid, {
          type: r.type,
          amount: r.amount,
          categoryId: r.categoryId,
          note: r.note,
          date: r.nextDueDate.toISOString(),
        })
        const nextDate = computeNextDueDate(r.nextDueDate, r.frequency)
        await updateRec(user.uid, r.id, { nextDueDate: nextDate })
        count++
      } catch (err) {
        console.error('Failed to process recurring:', r.id, err)
      }
    }

    if (count > 0) await fetchRecurrings()
    return count
  }, [user, recurrings, fetchRecurrings])

  const upcomingInDays = useCallback((days) => {
    const now = new Date()
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return recurrings.filter(
      (r) => r.isActive && r.nextDueDate && r.nextDueDate > now && r.nextDueDate <= limit
    )
  }, [recurrings])

  const upcoming3Days = useMemo(() => upcomingInDays(3), [upcomingInDays])

  return {
    recurrings,
    loading,
    error,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    processDueRecurrings,
    upcomingInDays,
    upcoming3Days,
    refetch: fetchRecurrings,
  }
}
