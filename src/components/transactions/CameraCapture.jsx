import { useEffect, useRef, useState } from 'react'
import { X, RotateCcw, Circle } from 'lucide-react'
import './CameraCapture.css'

export function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function start() {
      setReady(false)
      setError(null)

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('unsupported')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          video.onloadedmetadata = () => setReady(true)
        }
      } catch (err) {
        if (cancelled) return
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
          setError('denied')
        } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
          setError('notfound')
        } else {
          setError('unsupported')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [facingMode])

  const handleShutter = () => {
    const video = videoRef.current
    if (!video || !ready || busy) return
    setBusy(true)

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setBusy(false)
          return
        }
        const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
        onClose()
      },
      'image/jpeg',
      0.92
    )
  }

  const handleSwitch = () => {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))
  }

  const errorMessage = {
    denied: 'Ứng dụng chưa được cấp quyền camera. Hãy bật quyền trong cài đặt trình duyệt.',
    notfound: 'Không tìm thấy camera trên thiết bị.',
    unsupported: 'Thiết bị không hỗ trợ camera trong ứng dụng.',
  }[error]

  return (
    <div className="cam-capture">
      <button
        type="button"
        className="cam-capture-close"
        onClick={onClose}
        aria-label="Đóng"
      >
        <X size={22} />
      </button>

      {error ? (
        <div className="cam-capture-error">
          <p>{errorMessage}</p>
          <button type="button" className="cam-capture-error-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="cam-capture-video"
            autoPlay
            playsInline
            muted
          />

          <div className="cam-capture-controls">
            <button
              type="button"
              className="cam-capture-switch"
              onClick={handleSwitch}
              aria-label="Đổi camera"
              disabled={!ready || busy}
            >
              <RotateCcw size={20} />
            </button>

            <button
              type="button"
              className="cam-capture-shutter"
              onClick={handleShutter}
              aria-label="Chụp"
              disabled={!ready || busy}
            >
              <Circle size={56} strokeWidth={2} fill="#fff" />
            </button>

            <div className="cam-capture-spacer" />
          </div>

          {!ready && <div className="cam-capture-loading">Đang mở camera...</div>}
        </>
      )}
    </div>
  )
}
