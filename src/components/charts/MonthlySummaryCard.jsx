import { formatVND } from '../../utils/formatCurrency'

export function MonthlySummaryCard({ totalIncome, totalExpense, budgets }) {
  const balance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

  const now = new Date()
  const daysPassed = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const projected = daysPassed > 0 ? Math.round((totalExpense / daysPassed) * daysInMonth) : 0

  const budgetCount = budgets?.length || 0
  const overBudget = (budgets || []).filter((b) => b.percentage >= 90).length

  if (!totalIncome && !totalExpense) return null

  return (
    <div className="card animate-fade-in-up" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: 'white' }}>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 16, opacity: 0.9 }}>Tổng kết tháng</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '0.6875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Thu nhập</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{formatVND(totalIncome)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Chi tiêu</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{formatVND(totalExpense)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tiết kiệm</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {formatVND(Math.abs(balance))} {balance >= 0 ? '' : '(thiếu)'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tỷ lệ tiết kiệm</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{savingsRate}%</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgb(255 255 255 / 0.2)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
          <span>Dự báo cuối tháng</span>
          <span style={{ fontWeight: 600 }}>{formatVND(projected)}</span>
        </div>
        {budgetCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
            <span>Ngân sách</span>
            <span style={{ fontWeight: 600 }}>
              {overBudget > 0 ? `${overBudget}/${budgetCount} sắp vượt` : `${budgetCount} đang ổn`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
