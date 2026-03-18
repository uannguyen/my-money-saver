import { useState, useEffect, useCallback } from 'react'
import {
  getCustomParents,
  saveCustomParent,
  updateCustomParent,
  deleteCustomParent,
  addSubCategory as addSubCategoryService,
  deleteSubCategory as deleteSubCategoryService,
} from '../services/categoryService'
import {
  ALL_DEFAULT_PARENTS,
  DEFAULT_PARENT_IDS,
  DEFAULT_SUB_IDS,
} from '../constants/categories'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useCategories() {
  const { user } = useAuth()
  const [parents, setParents] = useState(ALL_DEFAULT_PARENTS)
  const [loading, setLoading] = useState(true)

  // Flat list of all categories (subs + parents) for transaction lookup
  const categories = parents.flatMap((p) => {
    const subs = p.subs.map((s) => ({ ...s, type: p.type, parentId: p.id, parentName: p.name }))
    return [...subs, { ...p, parentId: null, parentName: null }]
  })

  const fetchCategories = useCallback(async () => {
    if (!user?.uid) return
    try {
      setLoading(true)
      const customParents = await getCustomParents(user.uid)

      // Merge: default parents base + overrides/additions from Firestore
      const map = new Map()
      ALL_DEFAULT_PARENTS.forEach((p) => map.set(p.id, p))
      customParents.forEach((p) => {
        if (map.has(p.id)) {
          // Merge subs: default subs first, then any custom subs in Firestore
          const def = map.get(p.id)
          const defSubIds = new Set(def.subs.map((s) => s.id))
          const extraSubs = (p.subs || []).filter((s) => !defSubIds.has(s.id))
          map.set(p.id, { ...def, name: p.name || def.name, icon: p.icon || def.icon, subs: [...def.subs, ...extraSubs] })
        } else {
          map.set(p.id, p)
        }
      })
      setParents(Array.from(map.values()))
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error)
      toast.error('Không thể tải danh mục')
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ─── Parent actions ──────────────────────────────────────────────────────────

  const addParent = async (data) => {
    const id = `custom_parent_${Date.now()}`
    const newParent = { id, name: data.name, icon: data.icon, type: data.type, subs: [] }
    await saveCustomParent(user.uid, newParent)
    setParents((prev) => [...prev, newParent])
    return newParent
  }

  const updateParent = async (parentId, fields) => {
    await updateCustomParent(user.uid, parentId, fields)
    setParents((prev) =>
      prev.map((p) => (p.id === parentId ? { ...p, ...fields } : p))
    )
  }

  const deleteParent = async (parentId) => {
    if (DEFAULT_PARENT_IDS.has(parentId)) {
      toast.error('Không thể xóa danh mục mặc định')
      return
    }
    await deleteCustomParent(user.uid, parentId)
    setParents((prev) => prev.filter((p) => p.id !== parentId))
  }

  // ─── Sub actions ─────────────────────────────────────────────────────────────

  const addSubCategory = async (parentId, subData) => {
    const newSub = await addSubCategoryService(user.uid, parentId, subData)
    setParents((prev) =>
      prev.map((p) =>
        p.id === parentId ? { ...p, subs: [...p.subs, newSub] } : p
      )
    )
    return newSub
  }

  const deleteSubCategory = async (parentId, sub) => {
    if (DEFAULT_SUB_IDS.has(sub.id)) {
      toast.error('Không thể xóa danh mục phụ mặc định')
      return
    }
    await deleteSubCategoryService(user.uid, parentId, sub)
    setParents((prev) =>
      prev.map((p) =>
        p.id === parentId
          ? { ...p, subs: p.subs.filter((s) => s.id !== sub.id) }
          : p
      )
    )
  }

  // Backward-compat aliases (used by TransactionForm etc.)
  const addCategory = (data) => addParent(data)
  const updateCategory = (id, data) => updateParent(id, data)
  const deleteCategory = (id) => deleteParent(id)

  return {
    parents,
    categories,
    loading,
    fetchCategories,
    addParent,
    updateParent,
    deleteParent,
    addSubCategory,
    deleteSubCategory,
    // compat
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
