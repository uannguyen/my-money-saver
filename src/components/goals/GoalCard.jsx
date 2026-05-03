import { useState } from 'react'
import { PrivacyAmount } from '../privacy/PrivacyAmount'
import { formatDate } from '../../utils/dateHelpers'
import { formatVND } from '../../utils/formatCurrency'
import './GoalCard.css'

const TYPE_LABELS = {
  cash: 'Tiền mặt',
  bank: 'Ngân hàng',
  emergency: 'Khẩn cấp',
  investment: 'Đầu tư',
  sinking: 'Quỹ định kỳ',
  other: 'Khác',
}

const MOVEMENT_LABELS = {
  initial: 'Số dư ban đầu',
  deposit: 'Thêm tiền',
  withdraw: 'Rút tiền',
  adjustment: 'Điều chỉnh số dư',
}

export function GoalCard({ goal, onEdit, onDelete, onMovement }) {
  const [showHistory, setShowHistory] = useState(false)
  const lastMovement = goal.movements?.length
    ? [...goal.movements].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0]
    : null
  const maturityDate = goal.maturityDate ? new Date(goal.maturityDate) : null
  const daysToMaturity = maturityDate
    ? Math.ceil((maturityDate - new Date()) / (1000 * 60 * 60 * 24))
    : null
  const movements = (goal.movements || [])
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))

  return (
    <div className="goal-card card animate-fade-in-up">
      <div className="goal-card-header">
        <div className="goal-card-left">
          <div className="savings-fund-icon" style={{ background: goal.color || 'var(--color-primary)' }}>
            {goal.icon || '🏦'}
          </div>

          <div className="goal-card-info">
            <div className="goal-card-name">{goal.name}</div>
            <div className="savings-fund-meta">
              <span>{TYPE_LABELS[goal.fundType] || TYPE_LABELS.other}</span>
              {lastMovement?.date && <span>Cập nhật {formatDate(lastMovement.date)}</span>}
            </div>
          </div>
        </div>
        <PrivacyAmount amount={goal.balance || 0} className="savings-fund-balance" />
      </div>

      <div className="savings-fund-details">
        <div>
          <span>Góp/tháng</span>
          <PrivacyAmount amount={goal.monthlyContribution || 0} />
        </div>
        <div>
          <span>Lãi kỳ vọng</span>
          <strong>{goal.expectedReturnRate || 0}%/năm</strong>
        </div>
        <div>
          <span>Ngày đáo hạn</span>
          <strong>{maturityDate ? formatDate(maturityDate) : 'Chưa đặt'}</strong>
        </div>
        <div>
          <span>Thời gian còn lại</span>
          <strong>
            {daysToMaturity === null
              ? 'Chưa đặt'
              : daysToMaturity > 0
                ? `${daysToMaturity} ngày`
                : daysToMaturity === 0
                  ? 'Hôm nay'
                  : `Quá hạn ${Math.abs(daysToMaturity)} ngày`}
          </strong>
        </div>
      </div>

      {goal.note && <div className="savings-fund-note">{goal.note}</div>}

      <div className="goal-card-footer">
        <div className="goal-card-actions">
          <button className="btn btn-primary goal-deposit-btn" onClick={() => onMovement?.(goal, 'deposit')}>
            Thêm
          </button>
          <button className="btn btn-outline goal-deposit-btn" onClick={() => onMovement?.(goal, 'withdraw')}>
            Rút
          </button>
          <button className="btn btn-ghost goal-action-btn" onClick={() => setShowHistory(true)}>
            Lịch sử
          </button>
        </div>
        <div className="goal-card-actions">
          <button className="btn btn-ghost goal-action-btn" onClick={() => onEdit?.(goal)}>✏️</button>
          <button className="btn btn-ghost goal-action-btn" onClick={() => onDelete?.(goal)}>🗑️</button>
        </div>
      </div>

      {showHistory && (
        <div className="overlay" onClick={() => setShowHistory(false)}>
          <div className="dialog savings-history-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Lịch sử tiết kiệm</h3>
            <div className="savings-history-heading">
              <span>{goal.icon || '🏦'} {goal.name}</span>
              <PrivacyAmount amount={goal.balance || 0} />
            </div>

            {movements.length === 0 ? (
              <div className="savings-history-empty">Chưa có biến động số dư</div>
            ) : (
              <div className="savings-history-list">
                {movements.map((movement, index) => {
                  const delta = Number(movement.delta ?? movement.amount) || 0
                  const isNegative = delta < 0
                  const isAdjustment = movement.type === 'adjustment'
                  return (
                    <div key={`${movement.type}-${movement.date || index}-${index}`} className="savings-history-item">
                      <div className="savings-history-main">
                        <span className="savings-history-title">
                          {MOVEMENT_LABELS[movement.type] || 'Cập nhật'}
                        </span>
                        <span className="savings-history-date">
                          {movement.date ? formatDate(movement.date) : 'Không rõ ngày'}
                        </span>
                        {movement.note && <span className="savings-history-note">{movement.note}</span>}
                      </div>
                      <div className="savings-history-amount">
                        <span className={isNegative ? 'negative' : 'positive'}>
                          {isAdjustment ? '' : isNegative ? '-' : '+'}
                          {formatVND(Math.abs(isAdjustment ? movement.amount : delta))}
                        </span>
                        {movement.balanceAfter !== undefined && (
                          <small>Sau: {formatVND(movement.balanceAfter)}</small>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="dialog-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setShowHistory(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
