import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from './firebase'

function getBudgetsRef(userId) {
  return collection(db, 'users', userId, 'budgets')
}

/**
 * Add a new budget
 */
export async function addBudget(userId, data) {
  const ref = getBudgetsRef(userId)
  const docData = {
    categoryId: data.categoryId,
    amount: Number(data.amount),
    month: data.month,
  }
  const docRef = await addDoc(ref, docData)
  return { id: docRef.id, ...docData }
}

/**
 * Update a budget
 */
export async function updateBudget(userId, budgetId, data) {
  const ref = doc(db, 'users', userId, 'budgets', budgetId)
  const updates = {
    categoryId: data.categoryId,
    amount: Number(data.amount),
    month: data.month,
  }
  await updateDoc(ref, updates)
  return { id: budgetId, ...updates }
}

/**
 * Delete a budget
 */
export async function deleteBudget(userId, budgetId) {
  const ref = doc(db, 'users', userId, 'budgets', budgetId)
  await deleteDoc(ref)
}

/**
 * Get budgets for a given month
 */
export async function getBudgetsByMonth(userId, monthKey) {
  const ref = getBudgetsRef(userId)
  const q = query(ref, where('month', '==', monthKey))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}
