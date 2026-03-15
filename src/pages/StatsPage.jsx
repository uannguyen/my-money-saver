import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { Header } from '../components/layout/Header'
import { MonthlyBarChart } from '../components/charts/MonthlyBarChart'
import { CategoryPieChart } from '../components/charts/CategoryPieChart'
import { formatVND } from '../utils/formatCurrency'
import { getMonthKey } from '../utils/dateHelpers'
import { ALL_DEFAULT_CATEGORIES, getCategoryById } from '../constants/categories'
import './StatsPage.css'

export function StatsPage() {
  const [monthKey, setMonthKey] = useState(getMonthKey(new Date()))
  const { transactions, loading, expenseByCategory, totalIncome, totalExpense } =
    useTransactions(monthKey)

  // Top expense categories
  const topCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([catId, amount]) => ({
      ...getCategoryById(ALL_DEFAULT_CATEGORIES, catId),
      amount,
    }))

  return (
    <div className="page-container" id="stats-page">
      <Header monthKey={monthKey} onMonthChange={setMonthKey} />

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="stats-content">
          {/* Overview */}
          <div className="stats-overview card animate-fade-in-up">
            <div className="stats-overview-item">
              <span className="stats-overview-label">Tổng thu</span>
              <span className="stats-overview-value income">{formatVND(totalIncome)}</span>
            </div>
            <div className="stats-overview-divider" />
            <div className="stats-overview-item">
              <span className="stats-overview-label">Tổng chi</span>
              <span className="stats-overview-value expense">{formatVND(totalExpense)}</span>
            </div>
          </div>

          {/* Bar Chart */}
          <MonthlyBarChart transactions={transactions} />

          {/* Pie Chart */}
          <CategoryPieChart
            expenseByCategory={expenseByCategory}
            categories={ALL_DEFAULT_CATEGORIES}
          />

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <div className="card animate-fade-in-up">
              <h3 className="chart-title" style={{ marginBottom: 12 }}>
                Top danh mục chi nhiều
              </h3>
              <div className="top-categories">
                {topCategories.map((cat, i) => (
                  <div key={cat.id} className="top-cat-item">
                    <span className="top-cat-rank">{i + 1}</span>
                    <span className="top-cat-icon">{cat.icon}</span>
                    <span className="top-cat-name">{cat.name}</span>
                    <span className="top-cat-amount">{formatVND(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
