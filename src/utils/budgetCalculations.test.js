import assert from 'node:assert/strict'
import test from 'node:test'

import { getBudgetsWithSpent } from './budgetCalculations.js'

test('counts custom sub-category spending when budget targets its parent category', () => {
  const budgets = [
    { id: 'budget-1', categoryId: 'custom_food', amount: 300000 },
  ]
  const expenseByCategory = {
    custom_lunch: 70000,
    custom_coffee: 30000,
    unrelated_category: 999999,
  }
  const parents = [
    {
      id: 'custom_food',
      name: 'Ăn uống riêng',
      type: 'expense',
      subs: [
        { id: 'custom_lunch', name: 'Ăn trưa' },
        { id: 'custom_coffee', name: 'Cafe' },
      ],
    },
  ]

  const [budget] = getBudgetsWithSpent(budgets, expenseByCategory, parents)

  assert.equal(budget.spent, 100000)
  assert.equal(budget.remaining, 200000)
  assert.equal(budget.percentage, 33)
})

test('includes direct parent spending together with sub-category spending', () => {
  const budgets = [
    { id: 'budget-1', categoryId: 'food', amount: 200000 },
  ]
  const expenseByCategory = {
    food: 40000,
    eat_company: 60000,
  }
  const parents = [
    {
      id: 'food',
      name: 'Ăn uống',
      type: 'expense',
      subs: [{ id: 'eat_company', name: 'Ăn ngoài(công ty)' }],
    },
  ]

  const [budget] = getBudgetsWithSpent(budgets, expenseByCategory, parents)

  assert.equal(budget.spent, 100000)
  assert.equal(budget.remaining, 100000)
  assert.equal(budget.percentage, 50)
})
