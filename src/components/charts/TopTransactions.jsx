import { getCategoryById } from '../../constants/categories'
import { formatVND } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateHelpers'

export function TopTransactions({ transactions, categories }) {
  const top5 = (transactions || [])
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  if (!top5.length) return null

  return (
    <div className="card animate-fade-in-up">
      <h3 className="chart-title" style={{ marginBottom: 12 }}>Top 5 giao dịch lớn nhất</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {top5.map((t, i) => {
          const cat = getCategoryById(categories, t.categoryId)
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <span style={{ width: 20, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textAlign: 'center' }}>{i + 1}</span>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{cat.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.note || cat.name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{formatDate(t.date)}</div>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-expense)', flexShrink: 0 }}>
                -{formatVND(t.amount)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
