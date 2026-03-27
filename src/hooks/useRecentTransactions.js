import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getTransactionsByRange } from '../services/transactionService'

/**
 * Fetches transactions from the last `limitDays` days.
 * Used for category suggestion scoring.
 */
export function useRecentTransactions(limitDays = 30) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const since = new Date()
    since.setDate(since.getDate() - limitDays)
    since.setHours(0, 0, 0, 0)

    setLoading(true)
    getTransactionsByRange(user.uid, since, new Date())
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [user, limitDays])

  return { transactions, loading }
}
