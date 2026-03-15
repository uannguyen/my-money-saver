import { useState, useEffect, useCallback } from 'react'
import {
  getCustomCategories,
  addCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
} from '../services/categoryService'
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useCategories() {
  const { user } = useAuth()
  const [customCategories, setCustomCategories] = useState([])
  const [categories, setCategories] = useState(ALL_DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    if (!user?.uid) return
    try {
      setLoading(true)
      const customCats = await getCustomCategories(user.uid)
      setCustomCategories(customCats)
      setCategories([...ALL_DEFAULT_CATEGORIES, ...customCats])
    } catch (error) {
      console.error('Lỗi khi tải danh mục custom:', error)
      toast.error('Không thể tải danh mục của bạn')
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = async (data) => {
    const newCat = await addCustomCategory(user.uid, data)
    setCustomCategories((prev) => [...prev, newCat])
    setCategories((prev) => [...prev, newCat])
    return newCat
  }

  const updateCategory = async (id, data) => {
    await updateCustomCategory(user.uid, id, data)
    const update = (list) =>
      list.map((c) => (c.id === id ? { ...c, ...data } : c))
    setCustomCategories(update)
    setCategories(update)
  }

  const deleteCategory = async (id) => {
    await deleteCustomCategory(user.uid, id)
    const filter = (list) => list.filter((c) => c.id !== id)
    setCustomCategories(filter)
    setCategories(filter)
  }

  return {
    categories,
    customCategories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
