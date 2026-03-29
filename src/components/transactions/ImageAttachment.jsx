import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import './ImageAttachment.css'

export function ImageAttachment({ previewUrl, onSelectImage, onRemoveImage, uploading }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onSelectImage(file)
    }
    e.target.value = ''
  }

  return (
    <div className="img-attach">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div className="img-attach-preview">
          <img src={previewUrl} alt="Hóa đơn" className="img-attach-img" />
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
        <button
          type="button"
          className="img-attach-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={18} />
          <span>Đính kèm hóa đơn</span>
        </button>
      )}
    </div>
  )
}
