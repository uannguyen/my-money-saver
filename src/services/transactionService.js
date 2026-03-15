import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

function getTransactionsRef(userId) {
  return collection(db, 'users', userId, 'transactions')
}

/**
 * Add a new transaction
 */
export async function addTransaction(userId, data) {
  const ref = getTransactionsRef(userId)
  const docData = {
    type: data.type,
    amount: Number(data.amount),
    categoryId: data.categoryId,
    note: data.note || '',
    date: Timestamp.fromDate(new Date(data.date)),
    createdAt: Timestamp.now(),
  }
  const docRef = await addDoc(ref, docData)
  return { id: docRef.id, ...docData }
}

/**
 * Update a transaction
 */
export async function updateTransaction(userId, transactionId, data) {
  const ref = doc(db, 'users', userId, 'transactions', transactionId)
  const updates = {
    type: data.type,
    amount: Number(data.amount),
    categoryId: data.categoryId,
    note: data.note || '',
    date: Timestamp.fromDate(new Date(data.date)),
  }
  await updateDoc(ref, updates)
  return { id: transactionId, ...updates }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(userId, transactionId) {
  const ref = doc(db, 'users', userId, 'transactions', transactionId)
  await deleteDoc(ref)
}

/**
 * Get transactions for a given month
 * @param {string} monthKey e.g. "2025-03"
 */
export async function getTransactionsByMonth(userId, monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const ref = getTransactionsRef(userId)
  const q = query(
    ref,
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  }))
}

/**
 * Get transactions within a date range
 */
export async function getTransactionsByRange(userId, startDate, endDate) {
  const ref = getTransactionsRef(userId)
  const q = query(
    ref,
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  }))
}
