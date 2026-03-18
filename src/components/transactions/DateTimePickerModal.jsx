import { useState, useRef, useEffect } from 'react'
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

  // Scroll to selected item on mount / value change
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const idx = items.indexOf(value)
    if (idx < 0) return
    // Spacers at top/bottom = 2 items height each, so item center = idx * ITEM_HEIGHT + ITEM_HEIGHT/2
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
      // Snap
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
  // dateStr is "YYYY-MM-DDTHH:mm"
  const parsed = dateStr ? new Date(dateStr) : new Date()

  const [activeTab, setActiveTab] = useState('calendar') // 'calendar' | 'time'
  // Calendar state
  const [viewYear, setViewYear] = useState(parsed.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed.getMonth())
  const [selYear, setSelYear] = useState(parsed.getFullYear())
  const [selMonth, setSelMonth] = useState(parsed.getMonth())
  const [selDay, setSelDay] = useState(parsed.getDate())
  // Time state
  const [selHour, setSelHour] = useState(String(parsed.getHours()).padStart(2, '0'))
  const [selMinute, setSelMinute] = useState(String(parsed.getMinutes()).padStart(2, '0'))

  // Direct numeric input state
  const [inpSelHour, setInpSelHour] = useState(selHour)
  const [inpSelMinute, setInpSelMinute] = useState(selMinute)
  const [hourError, setHourError] = useState(false)
  const [minError, setMinError] = useState(false)
  const minInputRef = useRef(null)

  useEffect(() => {
    setInpSelHour(selHour)
    setHourError(false)
  }, [selHour])

  useEffect(() => {
    setInpSelMinute(selMinute)
    setMinError(false)
  }, [selMinute])

  const handleHourChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
    setInpSelHour(val)
    if (val.length === 2) {
      const num = parseInt(val, 10)
      if (num >= 0 && num <= 23) {
        setSelHour(val)
        setHourError(false)
        minInputRef.current?.focus()
      } else {
        setHourError(true)
      }
    } else {
      setHourError(val !== '' && parseInt(val, 10) > 23)
    }
  }

  const handleHourBlur = () => {
    if (inpSelHour === '') {
      setInpSelHour(selHour)
      setHourError(false)
      return
    }
    let num = parseInt(inpSelHour, 10)
    if (isNaN(num)) num = 0
    if (num > 23) num = 23
    const format = String(num).padStart(2, '0')
    setInpSelHour(format)
    setSelHour(format)
    setHourError(false)
  }

  const handleMinChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
    setInpSelMinute(val)
    if (val.length === 2) {
      const num = parseInt(val, 10)
      if (num >= 0 && num <= 59) {
        setSelMinute(val)
        setMinError(false)
        e.target.blur()
      } else {
        setMinError(true)
      }
    } else {
      setMinError(val !== '' && parseInt(val, 10) > 59)
    }
  }

  const handleMinBlur = () => {
    if (inpSelMinute === '') {
      setInpSelMinute(selMinute)
      setMinError(false)
      return
    }
    let num = parseInt(inpSelMinute, 10)
    if (isNaN(num)) num = 0
    if (num > 59) num = 59
    const format = String(num).padStart(2, '0')
    setInpSelMinute(format)
    setSelMinute(format)
    setMinError(false)
  }

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

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
    setSelHour(String(now.getHours()).padStart(2, '0'))
    setSelMinute(String(now.getMinutes()).padStart(2, '0'))
  }

  const handleConfirm = () => {
    const mm = String(selMonth + 1).padStart(2, '0')
    const dd = String(selDay).padStart(2, '0')
    const newDateStr = `${selYear}-${mm}-${dd}T${selHour}:${selMinute}`
    onConfirm(newDateStr)
  }

  // Tab header display
  const tabDateLabel = `${String(selMonth + 1).padStart(2, '0')}/${String(selDay).padStart(2, '0')}/${selYear}`
  const tabTimeLabel = `${selHour}:${selMinute}`

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
              <TimeWheel items={hours} value={selHour} onChange={setSelHour} />
              <div className="dtpm-colon">:</div>
              <TimeWheel items={minutes} value={selMinute} onChange={setSelMinute} />
            </div>

            <div className="dtpm-direct-inputs">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`dtpm-time-input ${hourError ? 'error' : ''}`}
                value={inpSelHour}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                onFocus={(e) => e.target.select()}
              />
              <span className="dtpm-time-input-colon">:</span>
              <input
                ref={minInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`dtpm-time-input ${minError ? 'error' : ''}`}
                value={inpSelMinute}
                onChange={handleMinChange}
                onBlur={handleMinBlur}
                onFocus={(e) => e.target.select()}
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
                  disabled={hourError || minError}
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
