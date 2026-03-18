import { useState, useRef, useEffect } from 'react'
import { TimeInput } from './TimeInput'
import './DateTimePickerModal.css'

// ─── helpers ────────────────────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay()
}

// ─── Time Wheel ──────────────────────────────────────────────────────────────
function TimeWheel({ items, value, onChange }) {
  const containerRef = useRef(null)
  const ITEM_HEIGHT = 44

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const idx = items.indexOf(value)
    if (idx < 0) return
    container.scrollTop = idx * ITEM_HEIGHT
  }, [value]) // eslint-disable-line

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return
    clearTimeout(container._scrollTimer)
    container._scrollTimer = setTimeout(() => {
      const idx = Math.round(container.scrollTop / ITEM_HEIGHT)
      const clamped = Math.max(0, Math.min(idx, items.length - 1))
      if (items[clamped] !== value) onChange(items[clamped])
      container.scrollTop = clamped * ITEM_HEIGHT
    }, 80)
  }

  return (
    <div className="dtpm-wheel-outer">
      <div
        className="dtpm-wheel-scroll"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div className="dtpm-wheel-spacer" />
        {items.map((item) => (
          <div
            key={item}
            className={`dtpm-wheel-item${item === value ? ' selected' : ''}`}
            onClick={() => {
              onChange(item)
              const container = containerRef.current
              const idx = items.indexOf(item)
              if (container) container.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' })
            }}
          >
            {item}
          </div>
        ))}
        <div className="dtpm-wheel-spacer" />
      </div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function DateTimePickerModal({ dateStr, onClose, onConfirm }) {
  const parsed = dateStr ? new Date(dateStr) : new Date()

  const [activeTab, setActiveTab] = useState('calendar')
  const [viewYear, setViewYear] = useState(parsed.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed.getMonth())
  const [selYear, setSelYear] = useState(parsed.getFullYear())
  const [selMonth, setSelMonth] = useState(parsed.getMonth())
  const [selDay, setSelDay] = useState(parsed.getDate())

  // Time state — stored as NUMBER, not string
  const [hour, setHour] = useState(parsed.getHours())
  const [minute, setMinute] = useState(parsed.getMinutes())

  const minuteInputRef = useRef(null)

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  // Derived strings for drum wheel + display
  const hourStr = String(hour).padStart(2, '0')
  const minuteStr = String(minute).padStart(2, '0')

  // Calendar grid
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth)
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const selectDay = (d) => {
    setSelDay(d)
    setSelYear(viewYear)
    setSelMonth(viewMonth)
  }

  const goToday = () => {
    const now = new Date()
    setViewYear(now.getFullYear()); setViewMonth(now.getMonth())
    setSelYear(now.getFullYear()); setSelMonth(now.getMonth()); setSelDay(now.getDate())
  }

  const setCurrentTime = () => {
    const now = new Date()
    setHour(now.getHours())
    setMinute(now.getMinutes())
  }

  const handleConfirm = () => {
    const mm = String(selMonth + 1).padStart(2, '0')
    const dd = String(selDay).padStart(2, '0')
    const newDateStr = `${selYear}-${mm}-${dd}T${hourStr}:${minuteStr}`
    onConfirm(newDateStr)
  }

  const tabDateLabel = `${String(selMonth + 1).padStart(2, '0')}/${String(selDay).padStart(2, '0')}/${selYear}`
  const tabTimeLabel = `${hourStr}:${minuteStr}`

  return (
    <div className="dtpm-overlay" onClick={onClose}>
      <div className="dtpm-modal" onClick={e => e.stopPropagation()}>

        {/* ── Tabs ── */}
        <div className="dtpm-tabs">
          <button
            type="button"
            className={`dtpm-tab${activeTab === 'calendar' ? ' active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            {tabDateLabel}
          </button>
          <button
            type="button"
            className={`dtpm-tab${activeTab === 'time' ? ' active' : ''}`}
            onClick={() => setActiveTab('time')}
          >
            {tabTimeLabel}
          </button>
        </div>

        {/* ── Calendar Panel ── */}
        {activeTab === 'calendar' && (
          <div className="dtpm-calendar">
            <div className="dtpm-cal-header">
              <button type="button" className="dtpm-nav-btn" onClick={prevMonth}>&lt;</button>
              <span className="dtpm-cal-title">{MONTHS[viewMonth]} {viewYear}</span>
              <button type="button" className="dtpm-nav-btn" onClick={nextMonth}>&gt;</button>
            </div>
            <div className="dtpm-cal-days-header">
              {DAYS.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="dtpm-cal-grid">
              {cells.map((day, idx) => {
                if (!day) return <span key={`e${idx}`} />
                const isSelected = day === selDay && viewMonth === selMonth && viewYear === selYear
                const isToday = (() => {
                  const now = new Date()
                  return day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear()
                })()
                return (
                  <button
                    key={day}
                    type="button"
                    className={`dtpm-day${isSelected ? ' selected' : ''}${isToday && !isSelected ? ' today' : ''}`}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
            <div className="dtpm-footer">
              <button type="button" className="dtpm-btn-text" onClick={goToday}>Today</button>
              <div className="dtpm-footer-right">
                <button type="button" className="dtpm-btn-close" onClick={onClose}>Close</button>
                <button type="button" className="dtpm-btn-confirm" onClick={handleConfirm}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Time Panel ── */}
        {activeTab === 'time' && (
          <div className="dtpm-time">
            <div className="dtpm-wheels-wrapper">
              <div className="dtpm-wheel-highlight" />
              <TimeWheel
                items={hours}
                value={hourStr}
                onChange={(v) => setHour(parseInt(v, 10))}
              />
              <div className="dtpm-colon">:</div>
              <TimeWheel
                items={minutes}
                value={minuteStr}
                onChange={(v) => setMinute(parseInt(v, 10))}
              />
            </div>

            <div className="dtpm-direct-inputs">
              <TimeInput
                value={hour}
                max={23}
                onChange={setHour}
                autoFocusNext={minuteInputRef}
              />
              <span className="dtpm-time-input-colon">:</span>
              <TimeInput
                ref={minuteInputRef}
                value={minute}
                max={59}
                onChange={setMinute}
              />
            </div>

            <div className="dtpm-footer">
              <button type="button" className="dtpm-btn-text" onClick={setCurrentTime}>Current time</button>
              <div className="dtpm-footer-right">
                <button type="button" className="dtpm-btn-close" onClick={onClose}>Close</button>
                <button
                  type="button"
                  className="dtpm-btn-confirm"
                  onClick={handleConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
