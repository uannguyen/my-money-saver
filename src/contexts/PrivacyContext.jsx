import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { PrivacyContext } from './privacyContextValue'
import {
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_SENSITIVE_CATEGORY_IDS,
  getPrivacySettings,
  savePrivacySettings,
} from '../services/privacyService'

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
}

function randomSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return bytesToBase64(bytes)
}

async function hashPin(pin, salt) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 120000,
      hash: 'SHA-256',
    },
    key,
    256
  )
  return bytesToBase64(bits)
}

export function PrivacyProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(DEFAULT_PRIVACY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [sessionAuthorized, setSessionAuthorized] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      if (!user) {
        setSettings(DEFAULT_PRIVACY_SETTINGS)
        setIsUnlocked(false)
        setSessionAuthorized(false)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await getPrivacySettings(user.uid)
        if (!cancelled) setSettings(data)
      } catch (err) {
        console.error('Failed to load privacy settings:', err)
        if (!cancelled) setSettings(DEFAULT_PRIVACY_SETTINGS)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSettings()
    return () => {
      cancelled = true
    }
  }, [user])

  const hasPin = Boolean(settings.pinHash && settings.salt)
  const privacyEnabled = Boolean(settings.enabled)

  useEffect(() => {
    if (!privacyEnabled || !isUnlocked) return undefined
    const minutes = Number(settings.lockAfterMinutes) || 10
    const timer = window.setTimeout(() => setIsUnlocked(false), minutes * 60 * 1000)
    return () => window.clearTimeout(timer)
  }, [isUnlocked, privacyEnabled, settings.lockAfterMinutes])

  const updatePrivacySettings = useCallback(
    async (patch) => {
      if (!user) return null
      const next = {
        ...settings,
        ...patch,
        sensitiveCategoryIds:
          patch.sensitiveCategoryIds || settings.sensitiveCategoryIds || DEFAULT_SENSITIVE_CATEGORY_IDS,
      }
      const saved = await savePrivacySettings(user.uid, next)
      setSettings((current) => ({ ...current, ...saved }))
      if (!next.enabled) {
        setIsUnlocked(false)
        setSessionAuthorized(false)
      }
      return saved
    },
    [settings, user]
  )

  const setupPin = useCallback(
    async (pin) => {
      if (!user) return false
      const salt = randomSalt()
      const pinHash = await hashPin(pin, salt)
      await updatePrivacySettings({
        enabled: true,
        pinHash,
        salt,
        sensitiveCategoryIds: Array.from(
          new Set([
            ...DEFAULT_SENSITIVE_CATEGORY_IDS,
            ...(settings.sensitiveCategoryIds || []),
          ])
        ),
      })
      setSessionAuthorized(true)
      setIsUnlocked(true)
      return true
    },
    [settings.sensitiveCategoryIds, updatePrivacySettings, user]
  )

  const verifyPin = useCallback(
    async (pin) => {
      if (!hasPin) return false
      const pinHash = await hashPin(pin, settings.salt)
      return pinHash === settings.pinHash
    },
    [hasPin, settings.pinHash, settings.salt]
  )

  const changePin = useCallback(
    async (currentPin, nextPin) => {
      if (!hasPin) return setupPin(nextPin)
      const ok = await verifyPin(currentPin)
      if (!ok) return false
      await setupPin(nextPin)
      return true
    },
    [hasPin, setupPin, verifyPin]
  )

  const unlock = useCallback(
    async (pin) => {
      if (!privacyEnabled) return true
      if (!hasPin) return false
      const ok = await verifyPin(pin)
      if (ok) {
        setSessionAuthorized(true)
        setIsUnlocked(true)
        setUnlockDialogOpen(false)
      }
      return ok
    },
    [hasPin, privacyEnabled, verifyPin]
  )

  const lock = useCallback(() => {
    setIsUnlocked(false)
    setUnlockDialogOpen(false)
  }, [])

  const requestUnlock = useCallback(() => {
    if (!privacyEnabled) return
    if (sessionAuthorized) {
      setIsUnlocked(true)
      return
    }
    setUnlockDialogOpen(true)
  }, [privacyEnabled, sessionAuthorized])

  const isAmountProtected = useCallback(
    ({ sensitive = true, categoryId, type } = {}) => {
      if (!sensitive) return false
      if (loading) return true
      if (!privacyEnabled) return false
      if (categoryId) return settings.sensitiveCategoryIds?.includes(categoryId)
      if (type === 'expense') return false
      return true
    },
    [loading, privacyEnabled, settings.sensitiveCategoryIds]
  )

  const shouldMaskAmount = useCallback(
    (options) => isAmountProtected(options) && !isUnlocked,
    [isAmountProtected, isUnlocked]
  )

  const value = useMemo(
    () => ({
      settings,
      loading,
      hasPin,
      privacyEnabled,
      isUnlocked,
      sessionAuthorized,
      unlockDialogOpen,
      setupPin,
      changePin,
      verifyPin,
      unlock,
      lock,
      requestUnlock,
      closeUnlockDialog: () => setUnlockDialogOpen(false),
      updatePrivacySettings,
      isAmountProtected,
      shouldMaskAmount,
    }),
    [
      hasPin,
      isUnlocked,
      sessionAuthorized,
      loading,
      privacyEnabled,
      settings,
      setupPin,
      changePin,
      verifyPin,
      unlock,
      lock,
      requestUnlock,
      updatePrivacySettings,
      isAmountProtected,
      shouldMaskAmount,
      unlockDialogOpen,
    ]
  )

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>
}
