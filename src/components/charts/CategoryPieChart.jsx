import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getCategoryById } from '../../constants/categories'
import { formatVND, formatVNDShort } from '../../utils/formatCurrency'
import './Charts.css'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
]

export function CategoryPieChart({ expenseByCategory, categories }) {
  const data = Object.entries(expenseByCategory)
    .map(([categoryId, amount]) => {
      const cat = getCategoryById(categories, categoryId)
      return { name: `${cat.icon} ${cat.name}`, value: amount, categoryId }
    })
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">🥧</div>
        <div className="title">Chưa có chi tiêu</div>
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="chart-container card">
      <h3 className="chart-title">Chi tiêu theo danh mục</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={entry.categoryId} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatVND(value)}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
              fontSize: '0.8125rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="chart-legend">
        {data.map((item, i) => (
          <div key={item.categoryId} className="chart-legend-item">
            <span
              className="chart-legend-dot"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="chart-legend-name">{item.name}</span>
            <span className="chart-legend-value">{formatVNDShort(item.value)}</span>
            <span className="chart-legend-pct">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
