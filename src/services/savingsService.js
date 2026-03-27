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
  increment,
  arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'

function getSavingsGoalsRef(userId) {
  return collection(db, 'users', userId, 'savingsGoals')
}

/**
 * Add a new savings goal
 */
export async function addSavingsGoal(userId, data) {
  const ref = getSavingsGoalsRef(userId)
  const docData = {
    name: data.name,
    targetAmount: Number(data.targetAmount),
    currentAmount: 0,
    icon: data.icon || '',
    color: data.color || '',
    deadline: data.deadline ? Timestamp.fromDate(new Date(data.deadline)) : null,
    isCompleted: false,
    deposits: [],
    createdAt: Timestamp.now(),
  }
  const docRef = await addDoc(ref, docData)
  return { id: docRef.id, ...docData }
}

/**
 * Update a savings goal
 */
export async function updateSavingsGoal(userId, goalId, data) {
  const ref = doc(db, 'users', userId, 'savingsGoals', goalId)
  const updates = {
    name: data.name,
    targetAmount: Number(data.targetAmount),
    icon: data.icon || '',
    color: data.color || '',
    deadline: data.deadline ? Timestamp.fromDate(new Date(data.deadline)) : null,
  }
  await updateDoc(ref, updates)
  return { id: goalId, ...updates }
}

/**
 * Delete a savings goal
 */
export async function deleteSavingsGoal(userId, goalId) {
  const ref = doc(db, 'users', userId, 'savingsGoals', goalId)
  await deleteDoc(ref)
}

/**
 * Get all savings goals ordered by createdAt desc
 */
export async function getSavingsGoals(userId) {
  const ref = getSavingsGoalsRef(userId)
  const q = query(ref, orderBy('createdAt', 'desc'))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    deadline: d.data().deadline?.toDate() || null,
    createdAt: d.data().createdAt?.toDate(),
  }))
}

/**
 * Deposit money to a savings goal
 * Uses atomic increment and arrayUnion
 */
export async function depositToGoal(userId, goalId, amount, note) {
  const ref = doc(db, 'users', userId, 'savingsGoals', goalId)

  const deposit = {
    amount: Number(amount),
    note: note || '',
    date: Timestamp.now(),
  }

  // First, get the current goal to check completion
  const goalsRef = getSavingsGoalsRef(userId)
  const q = query(goalsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  const goalDoc = snapshot.docs.find((d) => d.id === goalId)

  if (!goalDoc) throw new Error('Goal not found')

  const goalData = goalDoc.data()
  const newAmount = goalData.currentAmount + Number(amount)
  const isCompleted = newAmount >= goalData.targetAmount

  const updates = {
    currentAmount: increment(Number(amount)),
    deposits: arrayUnion(deposit),
  }

  if (isCompleted) {
    updates.isCompleted = true
  }

  await updateDoc(ref, updates)
  return { isCompleted }
}
