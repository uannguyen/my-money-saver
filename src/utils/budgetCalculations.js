export function buildSubIdsByParent(parents = []) {
  const subIdsByParent = new Map()

  for (const parent of parents || []) {
    if (!parent?.id) continue

    const subIds = (parent.subs || [])
      .map((sub) => sub?.id)
      .filter(Boolean)

    subIdsByParent.set(parent.id, subIds)
  }

  return subIdsByParent
}

export function getBudgetsWithSpent(budgets = [], expenseByCategory = {}, parents = []) {
  const subIdsByParent = buildSubIdsByParent(parents)

  return (budgets || []).map((budget) => {
    const amount = Number(budget.amount) || 0
    const subIds = subIdsByParent.get(budget.categoryId)
    const directSpent = Number(expenseByCategory[budget.categoryId]) || 0
    const spent = subIds?.length
      ? subIds.reduce((sum, subId) => {
          if (subId === budget.categoryId) return sum
          return sum + (Number(expenseByCategory[subId]) || 0)
        }, directSpent)
      : directSpent

    return {
      ...budget,
      spent,
      remaining: amount - spent,
      percentage: amount > 0 ? Math.round((spent / amount) * 100) : 0,
    }
  })
}
