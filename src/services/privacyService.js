import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export const DEFAULT_SENSITIVE_CATEGORY_IDS = ['salary', 'income_salary']

export const DEFAULT_PRIVACY_SETTINGS = {
  enabled: true,
  pinHash: '',
  salt: '',
  sensitiveCategoryIds: DEFAULT_SENSITIVE_CATEGORY_IDS,
  lockAfterMinutes: 10,
}

function getPrivacyDoc(userId) {
  return doc(db, 'users', userId, 'settings', 'privacy')
}

export async function getPrivacySettings(userId) {
  const ref = getPrivacyDoc(userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return DEFAULT_PRIVACY_SETTINGS
  const saved = snap.data()
  const sensitiveCategoryIds = Array.isArray(saved.sensitiveCategoryIds)
    ? saved.sensitiveCategoryIds
    : DEFAULT_SENSITIVE_CATEGORY_IDS

  return {
    ...DEFAULT_PRIVACY_SETTINGS,
    ...saved,
    sensitiveCategoryIds,
  }
}

export async function savePrivacySettings(userId, settings) {
  const ref = getPrivacyDoc(userId)
  const data = {
    ...settings,
    updatedAt: Timestamp.now(),
  }
  await setDoc(ref, data, { merge: true })
  return data
}
