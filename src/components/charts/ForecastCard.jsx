import { parseMonthKey } from '../../utils/dateHelpers'
import { formatVND } from '../../utils/formatCurrency'

export function ForecastCard({ totalIncome, totalExpense, recurrings, monthKey }) {
  const { year, month } = parseMonthKey(monthKey)
  const today = new Date()
  const daysPassed = today.getDate()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysRemaining = Math.max(0, daysInMonth - daysPassed)

  // Actual spent
  const actualSpent = totalExpense

  // Upcoming recurring expenses within remaining days of the month
  const monthEnd = new Date(year, month - 1, daysInMonth, 23, 59, 59, 999)
  const upcomingRecurring = (recurrings || [])
    .filter(
      (r) =>
        r.isActive &&
        r.type === 'expense' &&
        r.nextDueDate &&
        r.nextDueDate > today &&
        r.nextDueDate <= monthEnd
    )
    .reduce((sum, r) => sum + (r.amount || 0), 0)

  // Trend forecast: extrapolate current spending rate over remaining days
  const trendForecast = daysPassed > 0 ? Math.round((totalExpense / daysPassed) * daysRemaining) : 0

  // Projected balance at month end
  const projectedBalance = totalIncome - totalExpense - upcomingRecurring - trendForecast

  const progressPercent = Math.min(100, Math.round((daysPassed / daysInMonth) * 100))

  if (!totalIncome && !totalExpense) return null

  return (
    <div className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
      {/* Gradient header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          color: 'white',
          padding: '16px 16px 14px',
          margin: '-16px -16px 16px',
        }}
      >
        <div style={{ fontSize: '0.6875rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
          Dự kiến cuối tháng
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {formatVND(projectedBalance)}
        </div>
      </div>

      {/* Stat rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Đã chi</span>
          <span style={{ fontWeight: 600 }}>{formatVND(actualSpent)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Định kỳ sắp tới</span>
          <span style={{ fontWeight: 600 }}>{formatVND(upcomingRecurring)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Dự kiến chi thêm</span>
          <span style={{ fontWeight: 600 }}>{formatVND(trendForecast)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
            borderTop: '1px solid var(--color-border, #eee)',
            paddingTop: 10,
          }}
        >
          <span style={{ fontWeight: 600 }}>Dự kiến cuối tháng</span>
          <span
            style={{
              fontWeight: 700,
              color: projectedBalance >= 0 ? 'var(--color-income, #16a34a)' : 'var(--color-expense, #dc2626)',
            }}
          >
            {formatVND(projectedBalance)}
          </span>
        </div>
      </div>

      {/* Mini timeline progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
          <span>Ngày {daysPassed}</span>
          <span>{daysRemaining} ngày còn lại</span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: 'var(--color-border, #e5e7eb)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              borderRadius: 3,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  )
}
