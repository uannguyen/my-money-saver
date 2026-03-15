import { useState, useEffect } from 'react'
import { getCustomCategories } from '../services/categoryService'
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState(ALL_DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    if (!user?.uid) return
    try {
      setLoading(true)
      const customCats = await getCustomCategories(user.uid)
      setCategories([...ALL_DEFAULT_CATEGORIES, ...customCats])
    } catch (error) {
      console.error('Lỗi khi tải danh mục custom:', error)
      toast.error('Không thể tải danh mục của bạn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchCategories()
  }, [user?.uid])

  return { categories, loading, fetchCategories }
}
