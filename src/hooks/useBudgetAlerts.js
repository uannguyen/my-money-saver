import { useMemo, useCallback } from 'react'
import { getCategoryById } from '../constants/categories'
import { formatVND } from '../utils/formatCurrency'
import toast from 'react-hot-toast'

export function useBudgetAlerts(budgets, categories = []) {
  const alerts = useMemo(() => {
    return budgets
      .map((b) => {
        if (b.percentage < 70) return null

        const cat = getCategoryById(categories, b.categoryId)
        let level, message

        if (b.percentage >= 100) {
          level = 'exceeded'
          message = `${cat.name}: đã vượt ${formatVND(Math.abs(b.remaining))}`
        } else if (b.percentage >= 90) {
          level = 'danger'
          message = `${cat.name}: sắp hết ngân sách (${b.percentage}%)`
        } else {
          level = 'warning'
          message = `${cat.name}: đã dùng ${b.percentage}% ngân sách`
        }

        return { budget: b, level, message, category: cat }
      })
      .filter(Boolean)
  }, [budgets, categories])

  const alertCount = useMemo(
    () => alerts.filter((a) => a.level === 'danger' || a.level === 'exceeded').length,
    [alerts]
  )

  const showDailyToast = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10)
    alerts
      .filter((a) => a.level === 'danger' || a.level === 'exceeded')
      .forEach((a) => {
        const key = `budget_toast_${a.budget.categoryId}_${today}`
        if (localStorage.getItem(key)) return
        localStorage.setItem(key, '1')
        const icon = a.level === 'exceeded' ? '🚨' : '⚠️'
        toast(`${icon} ${a.message}`, { duration: 4000 })
      })
  }, [alerts])

  return {
    alerts,
    alertCount,
    hasAlerts: alertCount > 0,
    showDailyToast,
  }
}
