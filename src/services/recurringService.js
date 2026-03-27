import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

function getRecurringRef(userId) {
  return collection(db, 'users', userId, 'recurringTransactions')
}

export function computeNextDueDate(currentDate, frequency) {
  const d = new Date(currentDate)
  switch (frequency) {
    case 'daily': d.setDate(d.getDate() + 1); break
    case 'weekly': d.setDate(d.getDate() + 7); break
    case 'monthly': d.setMonth(d.getMonth() + 1); break
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break
  }
  return d
}

export async function addRecurring(userId, data) {
  const ref = getRecurringRef(userId)
  const docData = {
    type: data.type,
    amount: Number(data.amount),
    categoryId: data.categoryId,
    note: data.note || '',
    frequency: data.frequency,
    startDate: Timestamp.fromDate(new Date(data.startDate)),
    nextDueDate: Timestamp.fromDate(new Date(data.nextDueDate)),
    isActive: data.isActive !== false,
    createdAt: Timestamp.now(),
  }
  const docRef = await addDoc(ref, docData)
  return { id: docRef.id, ...docData }
}

export async function updateRecurring(userId, id, data) {
  const ref = doc(db, 'users', userId, 'recurringTransactions', id)
  const updates = {}
  if (data.type !== undefined) updates.type = data.type
  if (data.amount !== undefined) updates.amount = Number(data.amount)
  if (data.categoryId !== undefined) updates.categoryId = data.categoryId
  if (data.note !== undefined) updates.note = data.note
  if (data.frequency !== undefined) updates.frequency = data.frequency
  if (data.isActive !== undefined) updates.isActive = data.isActive
  if (data.nextDueDate !== undefined) {
    updates.nextDueDate = Timestamp.fromDate(new Date(data.nextDueDate))
  }
  await updateDoc(ref, updates)
  return { id, ...updates }
}

export async function deleteRecurring(userId, id) {
  const ref = doc(db, 'users', userId, 'recurringTransactions', id)
  await deleteDoc(ref)
}

export async function getRecurrings(userId) {
  const ref = getRecurringRef(userId)
  const q = query(ref, orderBy('nextDueDate', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    startDate: d.data().startDate?.toDate(),
    nextDueDate: d.data().nextDueDate?.toDate(),
    createdAt: d.data().createdAt?.toDate(),
  }))
}
