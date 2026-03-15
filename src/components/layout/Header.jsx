import { formatMonthDisplay, prevMonth, nextMonth } from '../../utils/dateHelpers'
import './Header.css'

export function Header({ monthKey, onMonthChange, title }) {
  if (title) {
    return (
      <header className="header">
        <h1 className="header-title">{title}</h1>
      </header>
    )
  }

  return (
    <header className="header">
      <button
        className="header-nav-btn"
        onClick={() => onMonthChange(prevMonth(monthKey))}
        aria-label="Tháng trước"
      >
        ‹
      </button>
      <h1 className="header-month">{formatMonthDisplay(monthKey)}</h1>
      <button
        className="header-nav-btn"
        onClick={() => onMonthChange(nextMonth(monthKey))}
        aria-label="Tháng sau"
      >
        ›
      </button>
    </header>
  )
}
