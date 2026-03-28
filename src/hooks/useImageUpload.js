import { useState, useEffect, useCallback } from 'react'
import { uploadReceiptImage } from '../services/imageService'

export function useImageUpload(initialImageUrl = null) {
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl)
  const [uploading, setUploading] = useState(false)
  const [removed, setRemoved] = useState(false)

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [])

  const selectImage = useCallback((file) => {
    if (!file) return
    // Revoke previous blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setRemoved(false)
  }, [previewUrl])

  const removeImage = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setImageFile(null)
    setPreviewUrl(null)
    if (initialImageUrl) {
      setRemoved(true)
    }
  }, [previewUrl, initialImageUrl])

  const uploadImage = useCallback(async (userId) => {
    if (!imageFile) return initialImageUrl && !removed ? initialImageUrl : null
    setUploading(true)
    try {
      const url = await uploadReceiptImage(userId, imageFile)
      return url
    } finally {
      setUploading(false)
    }
  }, [imageFile, initialImageUrl, removed])

  return {
    previewUrl,
    imageFile,
    uploading,
    removed,
    initialImageUrl,
    selectImage,
    removeImage,
    uploadImage,
  }
}
