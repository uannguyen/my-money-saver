import { useMemo } from 'react'

const WEIGHTS = {
  AMOUNT_EXACT:    10,
  AMOUNT_CLOSE:     6,  // ±20%
  AMOUNT_RANGE:     3,  // ±50%
  FREQ_30_DAYS:     1.0,
  FREQ_7_DAYS:      1.5, // bonus on top of FREQ_30_DAYS
  FREQ_TODAY:       2.0, // bonus on top of FREQ_7_DAYS
  TIME_SLOT_MATCH:  4,
}

function getTimeSlot(hour) {
  if (hour >= 6  && hour <= 9)  return 'breakfast'
  if (hour >= 10 && hour <= 13) return 'lunch'
  if (hour >= 14 && hour <= 17) return 'afternoon'
  if (hour >= 17 && hour <= 21) return 'dinner'
  return 'other'
}

const TIME_SLOT_CATEGORY_HINTS = {
  breakfast: ['eat_snack', 'eat_outside'],
  lunch:     ['eat_company', 'eat_snack'],
  afternoon: ['eat_snack', 'transport_grab'],
  dinner:    ['eat_outside', 'eat_party'],
  other:     [],
}

/**
 * Returns top 3 suggested categoryIds based on recent transaction history.
 *
 * @param {Array}  recentTransactions - transactions from last 30 days (Date objects, already converted)
 * @param {number} inputAmount        - debounced amount entered by user
 * @param {string} type               - 'expense' | 'income'
 * @returns {Array<{ categoryId: string, score: number }>}
 */
export function useCategorySuggestion(recentTransactions, inputAmount, type = 'expense') {
  const suggestions = useMemo(() => {
    if (!inputAmount || inputAmount <= 0 || !recentTransactions?.length) {
      return []
    }

    const now = new Date()
    const currentSlot = getTimeSlot(now.getHours())
    const slotHints = TIME_SLOT_CATEGORY_HINTS[currentSlot]

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days7Ago  = new Date(today); days7Ago.setDate(today.getDate() - 7)
    const days30Ago = new Date(today); days30Ago.setDate(today.getDate() - 30)

    const scoreMap = {}

    for (const tx of recentTransactions) {
      if (tx.type !== type) continue
      const { categoryId } = tx
      if (!categoryId) continue

      // date is already a Date object from transactionService
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
      if (txDate < days30Ago) continue

      if (!scoreMap[categoryId]) scoreMap[categoryId] = 0

      // Amount scoring
      const diff = Math.abs(tx.amount - inputAmount) / inputAmount
      if (diff === 0)       scoreMap[categoryId] += WEIGHTS.AMOUNT_EXACT
      else if (diff <= 0.2) scoreMap[categoryId] += WEIGHTS.AMOUNT_CLOSE
      else if (diff <= 0.5) scoreMap[categoryId] += WEIGHTS.AMOUNT_RANGE

      // Frequency scoring
      scoreMap[categoryId] += WEIGHTS.FREQ_30_DAYS
      if (txDate >= days7Ago) scoreMap[categoryId] += WEIGHTS.FREQ_7_DAYS
      if (txDate >= today)    scoreMap[categoryId] += WEIGHTS.FREQ_TODAY
    }

    // Time slot bonus
    for (const hintId of slotHints) {
      if (scoreMap[hintId] !== undefined) {
        scoreMap[hintId] += WEIGHTS.TIME_SLOT_MATCH
      } else {
        // Not in history but matches time slot — show with small score
        scoreMap[hintId] = WEIGHTS.TIME_SLOT_MATCH / 2
      }
    }

    return Object.entries(scoreMap)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 1)
      .map(([categoryId, score]) => ({ categoryId, score }))
  }, [recentTransactions, inputAmount, type])

  return suggestions
}
