import assert from 'node:assert/strict'
import test from 'node:test'

import { getCategorySuggestions } from './useCategorySuggestion.js'

function daysAgo(days) {
  const date = new Date('2026-06-14T12:00:00')
  date.setDate(date.getDate() - days)
  return date
}

test('prefers amount match over an unrelated frequent category', () => {
  const transactions = [
    ...Array.from({ length: 12 }, (_, index) => ({
      type: 'expense',
      categoryId: 'eat_company',
      amount: 20000,
      date: daysAgo(index % 6),
    })),
    {
      type: 'expense',
      categoryId: 'supermarket',
      amount: 100000,
      date: daysAgo(2),
    },
  ]

  const suggestions = getCategorySuggestions(transactions, 100000, 'expense', {
    now: new Date('2026-06-14T12:00:00'),
  })

  assert.equal(suggestions[0].categoryId, 'supermarket')
  assert.equal(suggestions[0].autoSelect, true)
})

test('does not auto-select category from time slot hint alone', () => {
  const suggestions = getCategorySuggestions([], 50000, 'expense', {
    now: new Date('2026-06-14T12:00:00'),
  })

  assert.equal(suggestions[0]?.categoryId, 'eat_company')
  assert.equal(suggestions[0]?.autoSelect, false)
})
