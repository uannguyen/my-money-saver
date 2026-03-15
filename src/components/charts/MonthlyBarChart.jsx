import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatVNDShort } from '../../utils/formatCurrency'
import './Charts.css'

export function MonthlyBarChart({ transactions }) {
  // Aggregate by day
  const dailyData = {}
  transactions.forEach((txn) => {
    const day = txn.date.getDate()
    if (!dailyData[day]) {
      dailyData[day] = { day: `${day}`, income: 0, expense: 0 }
    }
    if (txn.type === 'income') {
      dailyData[day].income += txn.amount
    } else {
      dailyData[day].expense += txn.amount
    }
  })

  const data = Object.values(dailyData).sort((a, b) => parseInt(a.day) - parseInt(b.day))

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📊</div>
        <div className="title">Chưa có dữ liệu</div>
      </div>
    )
  }

  return (
    <div className="chart-container card">
      <h3 className="chart-title">Thu chi theo ngày</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tickFormatter={formatVNDShort}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => formatVNDShort(value)}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
              fontSize: '0.8125rem',
            }}
          />
          <Bar dataKey="income" name="Thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Chi" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
