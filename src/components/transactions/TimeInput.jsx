import { useState, useRef, useEffect, forwardRef } from 'react'

/**
 * Self-contained numeric time input.
 *
 * Props:
 *   value       – number (0-23 for hours, 0-59 for minutes)
 *   max         – number (23 or 59)
 *   onChange     – (num) => void — called only when a valid 2-digit value is entered or on blur
 *   autoFocusNext – ref of the next input to focus after valid 2-digit entry (optional)
 *   className   – optional extra CSS class
 */
export const TimeInput = forwardRef(function TimeInput(
  { value, max, onChange, autoFocusNext, className },
  ref
) {
  const [display, setDisplay] = useState(String(value).padStart(2, '0'))
  const innerRef = useRef(null)
  const inputRef = ref || innerRef

  // Sync display when value changes from OUTSIDE (e.g. drum scroll)
  useEffect(() => {
    setDisplay(String(value).padStart(2, '0'))
  }, [value])

  const handleChange = (e) => {
    // Only keep digits, max 2 chars
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)

    // Store raw string as-is — NO padding, NO converting
    setDisplay(raw)

    // Only validate + notify parent when exactly 2 digits entered
    if (raw.length === 2) {
      const num = parseInt(raw, 10)
      if (num >= 0 && num <= max) {
        onChange(num)
        if (autoFocusNext?.current) {
          setTimeout(() => {
            autoFocusNext.current?.focus()
            autoFocusNext.current?.select()
          }, 0)
        }
      } else {
        // Out of range → clamp
        const clamped = Math.min(num, max)
        setDisplay(String(clamped).padStart(2, '0'))
        onChange(clamped)
      }
    }
    // If only 1 digit typed → do nothing, wait for second digit
  }

  const handleBlur = (e) => {
    // Read directly from e.target.value to prevent stale closure bugs
    // When autoFocusNext steals focus, state 'display' might not be updated yet
    const currentVal = e.target.value
    const num = parseInt(currentVal, 10)
    
    if (isNaN(num) || currentVal === '') {
      // Invalid/empty → revert to current value
      setDisplay(String(value).padStart(2, '0'))
    } else {
      // Pad single digit and clamp
      const clamped = Math.min(Math.max(num, 0), max)
      setDisplay(String(clamped).padStart(2, '0'))
      onChange(clamped)
    }
  }

  const handleFocus = (e) => {
    e.target.select()
  }

  return (
    <input
      ref={inputRef}
      className={`dtpm-time-input ${className || ''}`}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      maxLength={2}
    />
  )
})
