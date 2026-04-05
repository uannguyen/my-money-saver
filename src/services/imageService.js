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

/** Extract Cloudinary public_id from a secure_url */
function extractPublicId(imageUrl) {
  try {
    const url = new URL(imageUrl)
    // pathname: /da4omyjfo/image/upload/v1234567890/receipts/uid/filename.jpg
    const parts = url.pathname.split('/')
    const uploadIdx = parts.indexOf('upload')
    if (uploadIdx === -1) return null
    // skip version segment (vXXXXXX) if present
    let startIdx = uploadIdx + 1
    if (parts[startIdx] && /^v\d+$/.test(parts[startIdx])) startIdx++
    const withExt = parts.slice(startIdx).join('/')
    // remove extension
    return withExt.replace(/\.[^.]+$/, '')
  } catch {
    return null
  }
}

/** Generate SHA-1 signature (plain digest, as required by Cloudinary) */
async function sha1(message) {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-1', enc.encode(message))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Delete a receipt image from Cloudinary using the authenticated destroy API.
 * Silently ignores errors so image absence never blocks the main delete flow.
 */
export async function deleteReceiptImage(imageUrl) {
  if (!imageUrl) return
  const publicId = extractPublicId(imageUrl)
  if (!publicId) return

  try {
    const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY
    const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET
    const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const timestamp = Math.floor(Date.now() / 1000)
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`
    const signature = await sha1(toSign)

    const form = new FormData()
    form.append('public_id', publicId)
    form.append('timestamp', timestamp)
    form.append('api_key', API_KEY)
    form.append('signature', signature)

    await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`, {
      method: 'POST',
      body: form,
    })
  } catch {
    // Silent fail – do not block the caller
  }
}
