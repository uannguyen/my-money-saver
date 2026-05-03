import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
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

function toDate(value) {
  return value?.toDate ? value.toDate() : value || null
}

function normalizeFund(docSnapshot) {
  const data = docSnapshot.data()
  const balance = Number(data.balance ?? data.currentAmount ?? 0)
  const targetAmount = data.targetAmount != null ? Number(data.targetAmount) : null
  const legacyDeposits = (data.deposits || []).map((d) => ({
    type: 'deposit',
    amount: Number(d.amount) || 0,
    delta: Number(d.amount) || 0,
    note: d.note || '',
    date: toDate(d.date),
  }))

  return {
    id: docSnapshot.id,
    ...data,
    name: data.name || 'Khoản tiết kiệm',
    fundType: data.fundType || data.type || 'other',
    balance,
    monthlyContribution: Number(data.monthlyContribution) || 0,
    expectedReturnRate: Number(data.expectedReturnRate) || 0,
    note: data.note || '',
    targetAmount,
    currentAmount: balance,
    maturityDate: toDate(data.maturityDate || data.deadline),
    movements: (data.movements || legacyDeposits).map((m) => ({
      ...m,
      amount: Number(m.amount) || 0,
      delta: Number(m.delta ?? m.amount) || 0,
      date: toDate(m.date),
    })),
    deadline: toDate(data.deadline),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    lastMovementAt: toDate(data.lastMovementAt),
  }
}

/**
 * Add a new savings goal
 */
export async function addSavingsGoal(userId, data) {
  const ref = getSavingsGoalsRef(userId)
  const balance = Number(data.balance ?? data.currentAmount) || 0
  const createdAt = Timestamp.now()
  const initialMovement = balance !== 0
    ? [{
        type: 'initial',
        amount: Math.abs(balance),
        delta: balance,
        note: 'Số dư ban đầu',
        date: createdAt,
        balanceAfter: balance,
      }]
    : []

  const docData = {
    name: data.name,
    fundType: data.fundType || 'other',
    balance,
    monthlyContribution: Number(data.monthlyContribution) || 0,
    expectedReturnRate: Number(data.expectedReturnRate) || 0,
    maturityDate: data.maturityDate ? Timestamp.fromDate(new Date(data.maturityDate)) : null,
    note: data.note || '',
    icon: data.icon || '',
    color: data.color || '',
    isArchived: false,
    movements: initialMovement,
    lastMovementAt: balance !== 0 ? createdAt : null,
    createdAt,
  }
  const docRef = await addDoc(ref, docData)
  return { id: docRef.id, ...docData }
}

/**
 * Update a savings goal
 */
export async function updateSavingsGoal(userId, goalId, data) {
  const ref = doc(db, 'users', userId, 'savingsGoals', goalId)
  const snap = await getDoc(ref)
  const currentFund = snap.exists() ? normalizeFund(snap) : null
  const nextBalance = data.balance !== undefined ? Number(data.balance) || 0 : null
  const shouldAdjustBalance = currentFund && nextBalance !== null && nextBalance !== currentFund.balance
  const now = Timestamp.now()
  const updates = {
    name: data.name,
    fundType: data.fundType || 'other',
    monthlyContribution: Number(data.monthlyContribution) || 0,
    expectedReturnRate: Number(data.expectedReturnRate) || 0,
    maturityDate: data.maturityDate ? Timestamp.fromDate(new Date(data.maturityDate)) : null,
    note: data.note || '',
    icon: data.icon || '',
    color: data.color || '',
    updatedAt: now,
  }

  if (shouldAdjustBalance) {
    const delta = nextBalance - currentFund.balance
    updates.balance = nextBalance
    updates.currentAmount = nextBalance
    updates.lastMovementAt = now
    updates.movements = arrayUnion({
      type: 'adjustment',
      amount: nextBalance,
      delta,
      note: 'Điều chỉnh số dư từ form chỉnh sửa',
      date: now,
      balanceAfter: nextBalance,
    })
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
  return snapshot.docs.map(normalizeFund)
}

/**
 * Deposit money to a savings goal
 * Uses atomic increment and arrayUnion
 */
export async function depositToGoal(userId, goalId, amount, note) {
  return addSavingsMovement(userId, goalId, {
    type: 'deposit',
    amount,
    note,
  })
}

export async function addSavingsMovement(userId, goalId, data) {
  const ref = doc(db, 'users', userId, 'savingsGoals', goalId)
  const snap = await getDoc(ref)

  if (!snap.exists()) throw new Error('Savings fund not found')

  const fund = normalizeFund(snap)
  const rawAmount = Number(data.amount) || 0
  let delta = rawAmount
  if (data.type === 'withdraw') delta = -rawAmount
  if (data.type === 'adjustment') delta = rawAmount - fund.balance

  const balanceAfter = fund.balance + delta
  const movement = {
    type: data.type || 'deposit',
    amount: rawAmount,
    delta,
    note: data.note || '',
    date: Timestamp.now(),
    balanceAfter,
  }

  const updates = {
    balance: increment(delta),
    currentAmount: increment(delta),
    movements: arrayUnion(movement),
    lastMovementAt: movement.date,
    updatedAt: movement.date,
  }

  await updateDoc(ref, updates)
  return { balanceAfter, delta }
}
