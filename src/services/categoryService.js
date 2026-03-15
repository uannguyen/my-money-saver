import {
  collection,
  addDoc,
  query,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

function getCategoriesRef(userId) {
  return collection(db, 'users', userId, 'categories')
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
