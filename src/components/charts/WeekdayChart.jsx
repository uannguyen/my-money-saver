import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatVNDShort, formatVND } from '../../utils/formatCurrency'

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export function WeekdayChart({ transactions }) {
  const expenses = (transactions || []).filter((t) => t.type === 'expense')
  if (!expenses.length) return null

  const dayTotals = Array(7).fill(0)
  const dayCounts = Array(7).fill(0)
  expenses.forEach((t) => {
    const day = new Date(t.date).getDay()
    dayTotals[day] += t.amount
    dayCounts[day]++
  })

  const maxDay = dayTotals.indexOf(Math.max(...dayTotals))
  const data = DAY_NAMES.map((name, i) => ({
    name,
    amount: Math.round(dayCounts[i] > 0 ? dayTotals[i] / dayCounts[i] : 0),
    isMax: i === maxDay,
  }))

  return (
    <div className="card animate-fade-in-up">
      <h3 className="chart-title" style={{ marginBottom: 12 }}>Chi tiêu theo thứ</h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
        Trung bình chi nhiều nhất vào <strong>{DAY_NAMES[maxDay]}</strong>
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatVNDShort} />
          <Tooltip
            formatter={(val) => [formatVND(val), 'TB/ngày']}
            contentStyle={{ fontSize: '0.8125rem', borderRadius: 8 }}
          />
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
            fill="var(--color-primary)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
