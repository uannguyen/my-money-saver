import { useMemo } from 'react'

const WEIGHTS = {
  AMOUNT_EXACT:    10,
  AMOUNT_CLOSE:     6,  // ±20%
  AMOUNT_RANGE:     2,  // ±50%
  FREQ_30_DAYS:     0.45,
  FREQ_7_DAYS:      0.60,
  FREQ_TODAY:       0.80,
  TIME_SLOT_MATCH:  1.5,
}

const MAX_FREQUENCY = {
  DAYS_30: 3,
  DAYS_7: 2,
  TODAY: 1,
}

const AUTO_SELECT_MIN_SCORE = 8
const AUTO_SELECT_MIN_AMOUNT_SCORE = WEIGHTS.AMOUNT_CLOSE

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

function createStats() {
  return {
    amountScore: 0,
    count30: 0,
    count7: 0,
    countToday: 0,
    slotScore: 0,
  }
}

function getAmountScore(amount, inputAmount) {
  const diff = Math.abs(amount - inputAmount) / inputAmount
  if (diff === 0) return WEIGHTS.AMOUNT_EXACT
  if (diff <= 0.2) return WEIGHTS.AMOUNT_CLOSE
  if (diff <= 0.5) return WEIGHTS.AMOUNT_RANGE
  return 0
}

function getFrequencyScore(stats) {
  return (
    Math.min(stats.count30, MAX_FREQUENCY.DAYS_30) * WEIGHTS.FREQ_30_DAYS +
    Math.min(stats.count7, MAX_FREQUENCY.DAYS_7) * WEIGHTS.FREQ_7_DAYS +
    Math.min(stats.countToday, MAX_FREQUENCY.TODAY) * WEIGHTS.FREQ_TODAY
  )
}

export function getCategorySuggestions(
  recentTransactions,
  inputAmount,
  type = 'expense',
  { now = new Date(), limit = 3 } = {}
) {
  if (!inputAmount || inputAmount <= 0) {
    return []
  }

  const nowDate = now instanceof Date ? now : new Date(now)
  const currentSlot = getTimeSlot(nowDate.getHours())
  const slotHints = type === 'expense' ? TIME_SLOT_CATEGORY_HINTS[currentSlot] : []

  const today = new Date(nowDate)
  today.setHours(0, 0, 0, 0)
  const days7Ago = new Date(today); days7Ago.setDate(today.getDate() - 7)
  const days30Ago = new Date(today); days30Ago.setDate(today.getDate() - 30)

  const statsMap = {}

  for (const tx of recentTransactions || []) {
    if (tx.type !== type) continue
    const { categoryId } = tx
    if (!categoryId) continue

    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
    if (txDate < days30Ago) continue

    if (!statsMap[categoryId]) statsMap[categoryId] = createStats()

    const stats = statsMap[categoryId]
    const amount = Number(tx.amount) || 0
    stats.amountScore = Math.max(stats.amountScore, getAmountScore(amount, inputAmount))
    stats.count30 += 1
    if (txDate >= days7Ago) stats.count7 += 1
    if (txDate >= today) stats.countToday += 1
  }

  for (const hintId of slotHints) {
    if (!statsMap[hintId]) statsMap[hintId] = createStats()
    statsMap[hintId].slotScore = statsMap[hintId].count30 > 0
      ? WEIGHTS.TIME_SLOT_MATCH
      : WEIGHTS.TIME_SLOT_MATCH / 2
  }

  return Object.entries(statsMap)
    .map(([categoryId, stats]) => {
      const frequencyScore = getFrequencyScore(stats)
      const score = stats.amountScore + frequencyScore + stats.slotScore
      return {
        categoryId,
        score,
        amountScore: stats.amountScore,
        autoSelect: (
          stats.amountScore >= AUTO_SELECT_MIN_AMOUNT_SCORE ||
          score >= AUTO_SELECT_MIN_SCORE
        ),
      }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => (
      b.score - a.score ||
      b.amountScore - a.amountScore ||
      a.categoryId.localeCompare(b.categoryId)
    ))
    .slice(0, limit)
    .map(({ categoryId, score, autoSelect }) => ({ categoryId, score, autoSelect }))
}

/**
 * Returns suggested categoryIds based on recent transaction history.
 *
 * @param {Array}  recentTransactions - transactions from last 30 days (Date objects, already converted)
 * @param {number} inputAmount        - debounced amount entered by user
 * @param {string} type               - 'expense' | 'income'
 * @returns {Array<{ categoryId: string, score: number, autoSelect: boolean }>}
 */
export function useCategorySuggestion(recentTransactions, inputAmount, type = 'expense') {
  const suggestions = useMemo(
    () => getCategorySuggestions(recentTransactions, inputAmount, type),
    [recentTransactions, inputAmount, type]
  )

  return suggestions
}
