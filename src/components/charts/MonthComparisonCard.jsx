import { getCategoryById } from '../../constants/categories'
import { formatVND } from '../../utils/formatCurrency'

export function MonthComparisonCard({ currentTransactions, prevTransactions, categories }) {
  if (!currentTransactions?.length && !prevTransactions?.length) return null

  const compute = (txns) =>
    (txns || [])
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount
        return acc
      }, {})

  const current = compute(currentTransactions)
  const prev = compute(prevTransactions)
  const allCats = new Set([...Object.keys(current), ...Object.keys(prev)])

  const comparisons = Array.from(allCats)
    .map((catId) => {
      const cur = current[catId] || 0
      const prv = prev[catId] || 0
      const change = prv > 0 ? Math.round(((cur - prv) / prv) * 100) : cur > 0 ? 100 : 0
      return { catId, current: cur, previous: prv, change }
    })
    .filter((c) => c.current > 0 || c.previous > 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 6)

  if (!comparisons.length) return null

  const totalCurrent = Object.values(current).reduce((s, v) => s + v, 0)
  const totalPrev = Object.values(prev).reduce((s, v) => s + v, 0)
  const totalChange = totalPrev > 0 ? Math.round(((totalCurrent - totalPrev) / totalPrev) * 100) : 0

  return (
    <div className="card animate-fade-in-up">
      <h3 className="chart-title" style={{ marginBottom: 12 }}>So sánh tháng trước</h3>

      {totalPrev > 0 && (
        <div style={{ fontSize: '0.8125rem', marginBottom: 12, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: totalChange > 0 ? 'var(--color-expense-bg)' : 'var(--color-income-bg)' }}>
          Tháng này chi {totalChange > 0 ? 'nhiều hơn' : 'ít hơn'}{' '}
          <strong>{formatVND(Math.abs(totalCurrent - totalPrev))}</strong>{' '}
          ({totalChange > 0 ? '+' : ''}{totalChange}%)
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {comparisons.map(({ catId, current: cur, change }) => {
          const cat = getCategoryById(categories, catId)
          return (
            <div key={catId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{cat.icon}</span>
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{cat.name}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{formatVND(cur)}</span>
              {change !== 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: 48, textAlign: 'right', color: change > 0 ? 'var(--color-expense)' : 'var(--color-income)' }}>
                  {change > 0 ? '↑' : '↓'}{Math.abs(change)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
