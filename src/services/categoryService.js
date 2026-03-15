import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

function getCategoriesRef(userId) {
  return collection(db, 'users', userId, 'categories')
}

function getCategoryDoc(userId, id) {
  return doc(db, 'users', userId, 'categories', id)
}

/**
 * Add a new custom category for user
 */
export async function addCustomCategory(userId, data) {
  const ref = getCategoriesRef(userId)
  const docData = {
    name: data.name,
    icon: data.icon,
    type: data.type, // 'expense' or 'income'
    createdAt: Timestamp.now(),
  }
  const docRef = await addDoc(ref, docData)
  return { id: docRef.id, ...docData }
}

/**
 * Update an existing custom category
 */
export async function updateCustomCategory(userId, id, data) {
  const ref = getCategoryDoc(userId, id)
  const updateData = {
    name: data.name,
    icon: data.icon,
    updatedAt: Timestamp.now(),
  }
  await updateDoc(ref, updateData)
  return { id, ...updateData }
}

/**
 * Delete a custom category
 */
export async function deleteCustomCategory(userId, id) {
  const ref = getCategoryDoc(userId, id)
  await deleteDoc(ref)
}

/**
 * Get all custom categories for user
 */
export async function getCustomCategories(userId) {
  const ref = getCategoriesRef(userId)
  const q = query(ref)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  }))
}
