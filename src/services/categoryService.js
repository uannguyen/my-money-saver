import {
  collection,
  setDoc,
  deleteDoc,
  query,
  getDocs,
  getDoc,
  doc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

function getCategoriesRef(userId) {
  return collection(db, 'users', userId, 'categories')
}

function getParentDoc(userId, parentId) {
  return doc(db, 'users', userId, 'categories', parentId)
}

// ─── Parent Category CRUD ────────────────────────────────────────────────────

/**
 * Add or update a custom parent category (with optional subs array).
 */
export async function saveCustomParent(userId, parentData) {
  const id = parentData.id
  const ref = getParentDoc(userId, id)
  const data = {
    id,
    name: parentData.name,
    icon: parentData.icon,
    type: parentData.type,
    subs: parentData.subs || [],
    createdAt: Timestamp.now(),
  }
  await setDoc(ref, data, { merge: true })
  return data
}

/**
 * Update only the name/icon of a parent category.
 */
export async function updateCustomParent(userId, parentId, fields) {
  const ref = getParentDoc(userId, parentId)
  const data = {
    name: fields.name,
    icon: fields.icon,
    updatedAt: Timestamp.now(),
  }
  await setDoc(ref, data, { merge: true })
  return { id: parentId, ...data }
}

/**
 * Delete a custom parent category (and all its subs).
 */
export async function deleteCustomParent(userId, parentId) {
  const ref = getParentDoc(userId, parentId)
  await deleteDoc(ref)
}

// ─── Sub-Category CRUD ────────────────────────────────────────────────────────

/**
 * Add a sub-category to the parent's `subs` array.
 */
export async function addSubCategory(userId, parentId, subData) {
  const ref = getParentDoc(userId, parentId)
  const sub = {
    id: subData.id || `${parentId}_${Date.now()}`,
    name: subData.name,
    icon: subData.icon,
  }
  await setDoc(ref, { subs: arrayUnion(sub) }, { merge: true })
  return sub
}

/**
 * Remove a sub-category from the parent's `subs` array.
 * Requires the exact sub object to match (Firestore arrayRemove equality).
 */
export async function deleteSubCategory(userId, parentId, sub) {
  const ref = getParentDoc(userId, parentId)
  await setDoc(ref, { subs: arrayRemove(sub) }, { merge: true })
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Get all custom parent categories (each with subs array).
 */
export async function getCustomParents(userId) {
  const ref = getCategoriesRef(userId)
  const snapshot = await getDocs(query(ref))
  return snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    subs: d.data().subs || [],
  }))
}

// Keep old alias for any callers
export const getCustomCategories = getCustomParents
export const addCustomCategory = (userId, data) => saveCustomParent(userId, data)
export const updateCustomCategory = (userId, id, data) => updateCustomParent(userId, id, data)
export const deleteCustomCategory = deleteCustomParent

// ─── Pinned (Most Used) Categories ───────────────────────────────────────────

function getPinnedDoc(userId) {
  return doc(db, 'users', userId, 'settings', 'pinnedCategories')
}

/**
 * Get the user's pinned "most used" category IDs.
 * @returns {Promise<string[]>}
 */
export async function getPinnedCategories(userId) {
  const ref = getPinnedDoc(userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return []
  return snap.data().categoryIds || []
}

/**
 * Save the user's pinned category IDs (overwrites previous list).
 * @param {string} userId
 * @param {string[]} categoryIds
 */
export async function savePinnedCategories(userId, categoryIds) {
  const ref = getPinnedDoc(userId)
  await setDoc(ref, { categoryIds, updatedAt: Timestamp.now() })
}
