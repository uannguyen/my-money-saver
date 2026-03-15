/**
 * Get month key string from a Date
 * @param {Date} date
 * @returns {string} e.g. "2025-03"
 */
export function getMonthKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * Parse month key to { year, month }
 */
export function parseMonthKey(key) {
  const [year, month] = key.split('-').map(Number)
  return { year, month }
}

/**
 * Get previous month key
 */
export function prevMonth(key) {
  const { year, month } = parseMonthKey(key)
  if (month === 1) return `${year - 1}-12`
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

/**
 * Get next month key
 */
export function nextMonth(key) {
  const { year, month } = parseMonthKey(key)
  if (month === 12) return `${year + 1}-01`
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

/**
 * Format month key as display string
 * @returns {string} e.g. "Tháng 3, 2025"
 */
export function formatMonthDisplay(key) {
  const { year, month } = parseMonthKey(key)
  return `Tháng ${month}, ${year}`
}

/**
 * Format date as display string
 * @param {Date} date
 * @returns {string} e.g. "15/03/2025"
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format date as day label
 * @returns {string} e.g. "Hôm nay" / "Hôm qua" / "15 Tháng 3"
 */
export function formatDayLabel(date) {
  const d = date instanceof Date ? date : new Date(date)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (isSameDay(d, today)) return 'Hôm nay'
  if (isSameDay(d, yesterday)) return 'Hôm qua'

  const day = d.getDate()
  const month = d.getMonth() + 1
  return `${day} Tháng ${month}`
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * Get start and end of a month from month key
 */
export function getMonthRange(key) {
  const { year, month } = parseMonthKey(key)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return { start, end }
}

/**
 * Get today as a date string for input[type=date]
 * @returns {string} e.g. "2025-03-15"
 */
export function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Get today as a datetime string for input[type=datetime-local]
 * @returns {string} e.g. "2025-03-15T16:09"
 */
export function getTodayDateTimeString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${date}T${h}:${min}`
}
