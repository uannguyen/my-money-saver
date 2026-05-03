import { Eye, EyeOff } from 'lucide-react'
import { formatVND } from '../../utils/formatCurrency'
import { usePrivacy } from '../../contexts/privacyContextValue'
import './Privacy.css'

export function PrivacyAmount({
  amount,
  prefix = '',
  suffix = '',
  categoryId,
  type,
  sensitive = true,
  formatter = formatVND,
  className = '',
  style,
}) {
  const { shouldMaskAmount, isAmountProtected, requestUnlock, lock } = usePrivacy()
  const protectedAmount = isAmountProtected({ sensitive, categoryId, type })
  const masked = shouldMaskAmount({ sensitive, categoryId, type })
  const value = masked ? '••••••' : formatter(amount)

  return (
    <span className={`privacy-amount ${className}`.trim()} style={style}>
      <span>
        {prefix}
        {value}
        {suffix}
      </span>
      {protectedAmount && (
        <button
          type="button"
          className="privacy-eye-btn"
          onClick={(e) => {
            e.stopPropagation()
            if (masked) {
              requestUnlock()
            } else {
              lock()
            }
          }}
          aria-label={masked ? 'Hiện số tiền' : 'Ẩn số tiền'}
        >
          {masked ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      )}
    </span>
  )
}
