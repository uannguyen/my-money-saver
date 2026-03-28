const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Compress image using Canvas API
 * @returns {Promise<Blob>} JPEG blob
 */
function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

/**
 * Compress and upload a receipt image to Cloudinary
 * @returns {Promise<string>} Secure URL
 */
export async function uploadReceiptImage(userId, file) {
  const blob = await compressImage(file)
  const formData = new FormData()
  formData.append('file', blob, 'receipt.jpg')
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', `receipts/${userId}`)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  )
  if (!res.ok) throw new Error('Upload ảnh thất bại')
  const data = await res.json()
  return data.secure_url
}

/**
 * Cloudinary deletion requires API secret (không nên expose ở client).
 * Ảnh sẽ còn trong Cloudinary nhưng không hiển thị trong app nữa.
 */
export async function deleteReceiptImage(_imageUrl) {
  // no-op: deletion cần server-side API secret
}
