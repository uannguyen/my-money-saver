import { useMemo } from 'react'
import { getCategoryById } from '../constants/categories'
import { formatVND } from '../utils/formatCurrency'

const DAY_NAMES = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

export function useInsights(transactions, prevMonthTransactions, budgets, categories) {
  const insights = useMemo(() => {
    if (!transactions?.length) return []

    const expenses = transactions.filter((t) => t.type === 'expense')
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)

    const results = []

    // 1. Budget warning
    if (budgets?.length) {
      const critical = budgets.find((b) => b.percentage >= 80)
      if (critical) {
        const cat = getCategoryById(categories, critical.categoryId)
        results.push({
          id: 'budget_warning',
          type: 'budget_warning',
          icon: '⚠️',
          title: 'Cảnh báo ngân sách',
          description: `${cat.name}: đã dùng ${critical.percentage}% ngân sách`,
          color: 'var(--color-expense)',
        })
      }
    }

    // 2. Month comparison
    if (prevMonthTransactions?.length) {
      const prevExpense = prevMonthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0)
      if (prevExpense > 0) {
        const change = Math.round(((totalExpense - prevExpense) / prevExpense) * 100)
        if (change !== 0) {
          results.push({
            id: 'month_comparison',
            type: 'month_comparison',
            icon: change > 0 ? '📈' : '📉',
            title: 'So với tháng trước',
            description: `Chi tiêu ${change > 0 ? 'tăng' : 'giảm'} ${Math.abs(change)}% so với tháng trước`,
            color: change > 0 ? 'var(--color-expense)' : 'var(--color-income)',
          })
        }
      }
    }

    // 3. Top category
    if (expenses.length) {
      const byCat = {}
      expenses.forEach((t) => {
        byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount
      })
      const topId = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]
      if (topId) {
        const cat = getCategoryById(categories, topId[0])
        const pct = totalExpense > 0 ? Math.round((topId[1] / totalExpense) * 100) : 0
        results.push({
          id: 'top_category',
          type: 'top_category',
          icon: '🏆',
          title: 'Chi nhiều nhất',
          description: `${cat.icon} ${cat.name}: ${formatVND(topId[1])} (${pct}%)`,
          color: 'var(--color-primary)',
        })
      }
    }

    // 4. Spending day pattern
    if (expenses.length >= 7) {
      const dayTotals = Array(7).fill(0)
      const dayCounts = Array(7).fill(0)
      expenses.forEach((t) => {
        const day = new Date(t.date).getDay()
        dayTotals[day] += t.amount
        dayCounts[day]++
      })
      const dayAvgs = dayTotals.map((total, i) => dayCounts[i] > 0 ? total / dayCounts[i] : 0)
      const maxDay = dayAvgs.indexOf(Math.max(...dayAvgs))
      results.push({
        id: 'spending_day',
        type: 'spending_day',
        icon: '📅',
        title: 'Ngày chi nhiều nhất',
        description: `Bạn thường chi nhiều nhất vào ${DAY_NAMES[maxDay]}`,
        color: 'var(--color-text-secondary)',
      })
    }

    // 5. Saving streak
    if (transactions.length) {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      let streak = 0
      const checkDate = new Date(today)
      while (streak < 365) {
        const dayStr = checkDate.toISOString().slice(0, 10)
        const hasExpense = expenses.some(
          (t) => new Date(t.date).toISOString().slice(0, 10) === dayStr
        )
        if (hasExpense) break
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
      if (streak >= 2) {
        results.push({
          id: 'saving_streak',
          type: 'saving_streak',
          icon: '🎉',
          title: 'Chuỗi tiết kiệm',
          description: `${streak} ngày không chi tiêu liên tiếp`,
          color: 'var(--color-income)',
        })
      }
    }

    // 6. Forecast
    if (totalExpense > 0) {
      const now = new Date()
      const daysPassed = now.getDate()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      if (daysPassed > 0) {
        const projected = Math.round((totalExpense / daysPassed) * daysInMonth)
        const saved = totalIncome - projected
        results.push({
          id: 'forecast',
          type: 'forecast',
          icon: '🔮',
          title: 'Dự báo cuối tháng',
          description: `Dự kiến chi ${formatVND(projected)}${totalIncome > 0 ? `, ${saved >= 0 ? 'tiết kiệm' : 'thiếu'} ${formatVND(Math.abs(saved))}` : ''}`,
          color: saved >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
        })
      }
    }

    return results.slice(0, 4)
  }, [transactions, prevMonthTransactions, budgets, categories])

  return { insights }
}
