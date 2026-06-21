const DATE_INPUT_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function parseDateInput(value, endOfDay = false) {
  const match = DATE_INPUT_RE.exec(value || '')
  if (!match) {
    throw new Error('Ngày xuất không hợp lệ')
  }

  const [, yearStr, monthStr, dayStr] = match
  const year = Number(yearStr)
  const monthIndex = Number(monthStr) - 1
  const day = Number(dayStr)
  const date = endOfDay
    ? new Date(year, monthIndex, day, 23, 59, 59, 999)
    : new Date(year, monthIndex, day, 0, 0, 0, 0)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    throw new Error('Ngày xuất không hợp lệ')
  }

  return date
}

export function resolveExportRequest({ mode = 'all', startDate = '', endDate = '' } = {}) {
  const hasStartDate = Boolean(startDate)
  const hasEndDate = Boolean(endDate)

  if (mode === 'all' || (!hasStartDate && !hasEndDate)) {
    return {
      mode: 'all',
      startDate: null,
      endDate: null,
      filename: 'chi-tieu-tat-ca',
    }
  }

  if (!hasStartDate || !hasEndDate) {
    throw new Error('Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc')
  }

  const rangeStart = parseDateInput(startDate)
  const rangeEnd = parseDateInput(endDate, true)

  if (rangeStart > rangeEnd) {
    throw new Error('Ngày bắt đầu không được sau ngày kết thúc')
  }

  return {
    mode: 'range',
    startDate: rangeStart,
    endDate: rangeEnd,
    filename: `chi-tieu-${startDate}-den-${endDate}`,
  }
}
