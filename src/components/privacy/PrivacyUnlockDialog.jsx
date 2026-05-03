import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
import { usePrivacy } from '../../contexts/privacyContextValue'
import './Privacy.css'

export function PrivacyUnlockDialog() {
  const { unlockDialogOpen, closeUnlockDialog, unlock, setupPin, hasPin } = usePrivacy()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!unlockDialogOpen) return
    setPin('')
    setConfirmPin('')
    setError('')
    window.setTimeout(() => inputRef.current?.focus(), 80)
  }, [unlockDialogOpen])

  if (!unlockDialogOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pin.length !== 6) {
      setError('PIN cần đúng 6 số')
      return
    }

    if (!hasPin && pin !== confirmPin) {
      setError('PIN xác nhận không khớp')
      return
    }

    setSubmitting(true)
    try {
      const ok = hasPin ? await unlock(pin) : await setupPin(pin)
      if (ok && !hasPin) {
        closeUnlockDialog()
      }
      if (!ok) {
        setError('PIN không đúng')
        setPin('')
        setConfirmPin('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overlay privacy-unlock-overlay" onClick={closeUnlockDialog}>
      <form className="dialog privacy-dialog" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div className="privacy-dialog-icon">
          <Lock size={20} />
        </div>
        <h3 className="dialog-title">{hasPin ? 'Nhập PIN' : 'Tạo PIN'}</h3>
        <p className="dialog-message">
          {hasPin
            ? 'Mở khóa để hiện các khoản tiền nhạy cảm.'
            : 'Tạo PIN để bảo vệ các khoản tiền nhạy cảm.'}
        </p>
        <input
          ref={inputRef}
          className="privacy-pin-input"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••••"
          aria-label="PIN bảo mật"
        />
        {!hasPin && (
          <input
            className="privacy-pin-input"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Nhập lại PIN"
            aria-label="Xác nhận PIN bảo mật"
          />
        )}
        {error && <div className="privacy-error">{error}</div>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={closeUnlockDialog}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {hasPin ? 'Mở khóa' : 'Tạo PIN'}
          </button>
        </div>
      </form>
    </div>
  )
}
