import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useBudget } from '../hooks/useBudget'
import { useCategories } from '../hooks/useCategories'
import { useRecurring } from '../hooks/useRecurring'
import { Header } from '../components/layout/Header'
import { MonthlyBarChart } from '../components/charts/MonthlyBarChart'
import { CategoryPieChart } from '../components/charts/CategoryPieChart'
import { MonthComparisonCard } from '../components/charts/MonthComparisonCard'
import { TopTransactions } from '../components/charts/TopTransactions'
import { WeekdayChart } from '../components/charts/WeekdayChart'
import { MonthlySummaryCard } from '../components/charts/MonthlySummaryCard'
import { ForecastCard } from '../components/charts/ForecastCard'
import { PrivacyAmount } from '../components/privacy/PrivacyAmount'
import { formatVND } from '../utils/formatCurrency'
import { getMonthKey, prevMonth } from '../utils/dateHelpers'
import { getCategoryById } from '../constants/categories'
import './StatsPage.css'

export function StatsPage() {
  const [monthKey, setMonthKey] = useState(getMonthKey(new Date()))
  const { parents, categories } = useCategories()
  const { transactions, loading, expenseByCategory, totalIncome, totalExpense } =
    useTransactions(monthKey)
  const { transactions: prevTransactions } = useTransactions(prevMonth(monthKey))
  const { budgets } = useBudget(monthKey, expenseByCategory, parents)
  const { recurrings } = useRecurring()

  // Top expense categories
  const topCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([catId, amount]) => ({
      ...getCategoryById(categories, catId),
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
          {/* Cash Flow Forecast */}
          <ForecastCard
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            recurrings={recurrings}
            monthKey={monthKey}
          />

          {/* Overview */}
          <div className="stats-overview card animate-fade-in-up">
            <div className="stats-overview-item">
              <span className="stats-overview-label">Tổng thu</span>
              <PrivacyAmount amount={totalIncome} type="income" className="stats-overview-value income" />
            </div>
            <div className="stats-overview-divider" />
            <div className="stats-overview-item">
              <span className="stats-overview-label">Tổng chi</span>
              <PrivacyAmount amount={totalExpense} type="expense" sensitive={false} className="stats-overview-value expense" />
            </div>
          </div>

          {/* Bar Chart */}
          <MonthlyBarChart transactions={transactions} />

          {/* Pie Chart */}
          <CategoryPieChart
            expenseByCategory={expenseByCategory}
            categories={categories}
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

          {/* Month Comparison */}
          <MonthComparisonCard
            currentTransactions={transactions}
            prevTransactions={prevTransactions}
            categories={categories}
          />

          {/* Top 5 Transactions */}
          <TopTransactions transactions={transactions} categories={categories} />

          {/* Weekday Chart */}
          <WeekdayChart transactions={transactions} />

          {/* Monthly Summary */}
          <MonthlySummaryCard
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            budgets={budgets}
          />
        </div>
      )}
    </div>
  )
}
