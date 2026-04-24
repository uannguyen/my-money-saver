import { useRef, useState } from 'react'
import { Camera, ImageIcon, X, ZoomIn } from 'lucide-react'
import { CameraCapture } from './CameraCapture'
import './ImageAttachment.css'

export function ImageAttachment({ previewUrl, onSelectImage, onRemoveImage, uploading }) {
  const galleryInputRef = useRef(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onSelectImage(file)
    }
    e.target.value = ''
  }

  return (
    <div className="img-attach">
      {/* Gallery input — no capture, lets user pick existing photo */}
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div className="img-attach-preview">
          {/* Preview image — tap to open lightbox */}
          <img
            src={previewUrl}
            alt="Hóa đơn"
            className="img-attach-img"
            onClick={() => setLightboxOpen(true)}
          />

          {/* Zoom hint */}
          <div className="img-attach-zoom-hint" onClick={() => setLightboxOpen(true)}>
            <ZoomIn size={14} />
            <span>Xem toàn bộ</span>
          </div>

          {uploading && (
            <div className="img-attach-uploading">
              <div className="img-attach-spinner" />
            </div>
          )}
          <button
            type="button"
            className="img-attach-remove"
            onClick={onRemoveImage}
            aria-label="Xóa ảnh"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="img-attach-actions">
          <button
            type="button"
            className="img-attach-btn"
            onClick={() => setCameraOpen(true)}
          >
            <Camera size={18} />
            <span>Chụp hóa đơn</span>
          </button>
          <button
            type="button"
            className="img-attach-btn img-attach-btn--gallery"
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImageIcon size={18} />
            <span>Chọn từ thư viện</span>
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="img-lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
          <button
            type="button"
            className="img-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
          <img
            src={previewUrl}
            alt="Hóa đơn (full)"
            className="img-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* In-app camera — avoids Android PWA reload from capture="environment" Intent */}
      {cameraOpen && (
        <CameraCapture
          onCapture={onSelectImage}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  )
}
