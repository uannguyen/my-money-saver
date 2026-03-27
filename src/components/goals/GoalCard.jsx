import { formatVND } from '../../utils/formatCurrency'
import './GoalCard.css'

export function GoalCard({ goal, onEdit, onDelete, onDeposit }) {
  const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
  const r = 28
  const c = 2 * Math.PI * r
  const remaining = goal.targetAmount - goal.currentAmount

  // Calculate days until deadline
  let deadlineDays = null
  if (goal.deadline) {
    const now = new Date()
    const dl = new Date(goal.deadline)
    const diff = Math.ceil((dl - now) / (1000 * 60 * 60 * 24))
    deadlineDays = diff
  }

  return (
    <div className={`goal-card card animate-fade-in-up ${goal.isCompleted ? 'goal-completed' : ''}`}>
      <div className="goal-card-header">
        <div className="goal-card-left">
          <svg width="64" height="64" viewBox="0 0 64 64" className="goal-ring">
            <circle
              cx="32" cy="32" r={r}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="4"
            />
            <circle
              cx="32" cy="32" r={r}
              fill="none"
              stroke={goal.isCompleted ? '#22c55e' : (goal.color || 'var(--color-primary)')}
              strokeWidth="4"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct / 100)}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
            />
            <text
              x="32" y="32"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="700"
              fill="var(--color-text)"
            >
              {pct}%
            </text>
          </svg>

          <div className="goal-card-info">
            <div className="goal-card-name">
              <span className="goal-card-icon">{goal.icon || ''}</span>
              {goal.name}
              {goal.isCompleted && <span className="goal-check"> ✅</span>}
            </div>
            <div className="goal-card-amounts">
              {formatVND(goal.currentAmount)} / {formatVND(goal.targetAmount)}
            </div>
            <div className="goal-card-remaining">
              {goal.isCompleted
                ? 'Hoàn thành!'
                : `Còn thiếu ${formatVND(remaining)}`}
            </div>
          </div>
        </div>
      </div>

      <div className="goal-card-footer">
        <div className="goal-card-deadline">
          {deadlineDays !== null && (
            deadlineDays > 0
              ? <span>⏳ {deadlineDays} ngày</span>
              : deadlineDays === 0
                ? <span className="goal-deadline-today">📌 Hôm nay</span>
                : <span className="goal-deadline-passed">⚠️ Quá hạn {Math.abs(deadlineDays)} ngày</span>
          )}
        </div>

        <div className="goal-card-actions">
          {!goal.isCompleted && (
            <button
              className="btn btn-primary goal-deposit-btn"
              onClick={() => onDeposit?.(goal)}
            >
              Nạp tiền
            </button>
          )}
          <button
            className="btn btn-ghost goal-action-btn"
            onClick={() => onEdit?.(goal)}
          >
            ✏️
          </button>
          <button
            className="btn btn-ghost goal-action-btn"
            onClick={() => onDelete?.(goal)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
