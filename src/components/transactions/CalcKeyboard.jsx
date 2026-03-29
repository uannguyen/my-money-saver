import './CalcKeyboard.css'

function evalExpression(expr) {
  const safe = expr.replace(/×/g, '*').replace(/÷/g, '/')
  if (!/^[\d+\-*/. ]+$/.test(safe)) return null
  try {
    const result = Function('"use strict"; return (' + safe + ')')()
    if (!isFinite(result) || result < 0) return null
    return Math.round(result)
  } catch {
    return null
  }
}

// Flat grid layout: 4 cols × 5 rows, Done spans row 4-5 col 4
const KEYS = [
  { key: 'AC',   type: 'fn' },
  { key: '÷',    type: 'op' },
  { key: '×',    type: 'op' },
  { key: '⌫',    type: 'fn' },

  { key: '7',    type: 'num' },
  { key: '8',    type: 'num' },
  { key: '9',    type: 'num' },
  { key: '-',    type: 'op' },

  { key: '4',    type: 'num' },
  { key: '5',    type: 'num' },
  { key: '6',    type: 'num' },
  { key: '+',    type: 'op' },

  { key: '1',    type: 'num' },
  { key: '2',    type: 'num' },
  { key: '3',    type: 'num' },
  { key: 'Done', type: 'done', rowSpan: 2 },

  { key: '0',    type: 'num' },
  { key: '000',  type: 'num' },
  { key: '.',    type: 'num' },
  // col 4 row 5 occupied by Done span
]

export function CalcKeyboard({ expression, onChange, onDone }) {
  const hasOperator = /[+\-×÷]/.test(expression)

  const handleKey = (key) => {
    if (key === 'AC') { onChange(''); return }
    if (key === '⌫') { onChange(expression.slice(0, -1)); return }
    if (key === '=') {
      const result = evalExpression(expression)
      if (result !== null && result > 0) onChange(String(result))
      return
    }
    if (key === 'Done') {
      onDone()
      return
    }
    if (key === '000') {
      if (!expression || expression === '0') return
      onChange(expression + '000')
      return
    }
    if (key === '.') {
      // only useful inside expressions
      onChange(expression + '.')
      return
    }
    if (['+', '-', '×', '÷'].includes(key)) {
      if (!expression) return
      const last = expression.slice(-1)
      if (['+', '-', '×', '÷'].includes(last)) {
        onChange(expression.slice(0, -1) + key)
      } else {
        onChange(expression + key)
      }
      return
    }
    onChange(expression + key)
  }

  const doneKey = hasOperator ? '=' : 'Done'

  return (
    <div className="calc-keyboard" role="group" aria-label="Calculator keyboard">
      {KEYS.map(({ key, type, rowSpan }) => {
        const resolvedKey = key === 'Done' ? doneKey : key
        return (
          <button
            key={key}
            type="button"
            className={`calc-key calc-key--${type}`}
            style={rowSpan ? { gridRow: `span ${rowSpan}` } : undefined}
            aria-label={resolvedKey === '⌫' ? 'Xóa' : resolvedKey === 'Done' ? 'Xong' : resolvedKey}
            onPointerDown={(e) => { e.preventDefault(); handleKey(resolvedKey) }}
          >
            {resolvedKey === '⌫' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                <line x1="18" y1="9" x2="12" y2="15"/>
                <line x1="12" y1="9" x2="18" y2="15"/>
              </svg>
            ) : resolvedKey}
          </button>
        )
      })}
    </div>
  )
}
