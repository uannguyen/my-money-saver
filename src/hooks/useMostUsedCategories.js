import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRecentTransactions } from './useRecentTransactions'
import { useCategories } from './useCategories'
import { getPinnedCategories, savePinnedCategories } from '../services/categoryService'
import { getCategoryById } from '../constants/categories'

const MOST_USED_COUNT = 7

/**
 * Provides the "Most Used" categories list for quick selection.
 *
 * Priority:
 *   1. User-pinned categories (stored in Firebase)
 *   2. Auto-computed from recent transaction frequency
 *
 * @param {'expense'|'income'} type
 * @returns {{ mostUsed, pinnedIds, loading, savePinned, refetch }}
 */
export function useMostUsedCategories(type = 'expense') {
  const { user } = useAuth()
  const { categories } = useCategories()
  const { transactions } = useRecentTransactions(30)
  const [pinnedIds, setPinnedIds] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch pinned categories from Firebase
  const fetchPinned = useCallback(async () => {
    if (!user?.uid) return
    try {
      setLoading(true)
      const ids = await getPinnedCategories(user.uid)
      setPinnedIds(ids)
    } catch (err) {
      console.error('Failed to fetch pinned categories:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    fetchPinned()
  }, [fetchPinned])

  // Save pinned categories to Firebase
  const savePinned = useCallback(async (ids) => {
    if (!user?.uid) return
    await savePinnedCategories(user.uid, ids)
    setPinnedIds(ids)
  }, [user?.uid])

  // Compute most-used from recent transactions (fallback)
  const computedMostUsed = (() => {
    if (!transactions?.length) return []

    const countMap = {}
    for (const tx of transactions) {
      if (tx.type !== type) continue
      const { categoryId } = tx
      if (!categoryId) continue
      countMap[categoryId] = (countMap[categoryId] || 0) + 1
    }

    return Object.entries(countMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MOST_USED_COUNT)
      .map(([categoryId]) => categoryId)
  })()

  // Resolve final list: pinned first, then fill remaining slots with computed (no duplicates)
  const resolvedIds = (() => {
    if (pinnedIds.length === 0) return computedMostUsed

    const pinnedSlice = pinnedIds.slice(0, MOST_USED_COUNT)
    const remaining = MOST_USED_COUNT - pinnedSlice.length
    if (remaining <= 0) return pinnedSlice

    const pinnedSet = new Set(pinnedSlice)
    const extras = computedMostUsed.filter((id) => !pinnedSet.has(id)).slice(0, remaining)
    return [...pinnedSlice, ...extras]
  })()

  // Map IDs → full category objects
  const mostUsed = resolvedIds
    .map((id) => getCategoryById(categories, id))
    .filter((cat) => cat && cat.name !== 'Không rõ')

  return {
    mostUsed,
    pinnedIds,
    loading,
    savePinned,
    refetch: fetchPinned,
  }
}
