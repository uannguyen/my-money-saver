/**
 * Format number as VND currency
 * @param {number} amount
 * @returns {string} e.g. "1.500.000đ"
 */
export function formatVND(amount) {
  if (amount == null || isNaN(amount)) return '0đ'
  const formatted = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return amount < 0 ? `-${formatted}đ` : `${formatted}đ`
}

/**
 * Format number as short VND (e.g. 1.5M, 250K)
 */
export function formatVNDShort(amount) {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`
  return `${sign}${abs}đ`
}

/**
 * Parse VND string back to number
 * @param {string} str e.g. "1.500.000" or "1500000"
 * @returns {number}
 */
export function parseVND(str) {
  if (!str) return 0
  const cleaned = str.replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
}
