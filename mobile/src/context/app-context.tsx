import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { getLocales } from 'expo-localization'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import {
  authenticateAccount as apiAuthenticate,
  liveApiEnabled,
  logoutAccount,
  syncOnboarding,
  syncPlanMode,
  syncWorkout,
} from '../api'
import type {
  AuthInput,
  AuthUser,
  Language,
  OnboardingAnswers,
  PlanMode,
  SyncStatus,
  WorkoutLog,
} from '../types'

type AppState = {
  language: Language
  studioCode: string | null
  user: AuthUser | null
  sessionToken: string | null
  onboarding: OnboardingAnswers | null
  planMode: PlanMode | null
  logs: WorkoutLog[]
  syncStatus: SyncStatus
  ready: boolean
}

type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string }

type AppContextValue = AppState & {
  liveApiEnabled: boolean
  setLanguage: (language: Language) => void
  connectStudio: (code: string) => boolean
  authenticate: (input: AuthInput) => Promise<AuthResult>
  logout: () => Promise<void>
  saveOnboarding: (answers: OnboardingAnswers) => void
  activatePlan: (mode: PlanMode) => void
  saveWorkout: (log: WorkoutLog) => void
  reset: () => void
}

const storageKey = 'fitpath-state-v2'
const sessionStorageKey = 'fitpath-session-v1'

const deviceLanguage = (): Language => {
  const code = getLocales()[0]?.languageCode
  if (code === 'tr' || code === 'en') return code
  return 'de'
}

const initialState: AppState = {
  language: deviceLanguage(),
  studioCode: null,
  user: null,
  sessionToken: null,
  onboarding: null,
  planMode: null,
  logs: [],
  syncStatus: liveApiEnabled ? 'idle' : 'offline',
  ready: false,
}

const getStoredSession = () =>
  process.env.EXPO_OS === 'web'
    ? AsyncStorage.getItem(sessionStorageKey)
    : SecureStore.getItemAsync(sessionStorageKey)

const storeSession = (token: string) =>
  process.env.EXPO_OS === 'web'
    ? AsyncStorage.setItem(sessionStorageKey, token)
    : SecureStore.setItemAsync(sessionStorageKey, token)

const removeStoredSession = () =>
  process.env.EXPO_OS === 'web'
    ? AsyncStorage.removeItem(sessionStorageKey)
    : SecureStore.deleteItemAsync(sessionStorageKey)

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(storageKey), getStoredSession()])
      .then(([stored, sessionToken]) => {
        const persisted = stored ? JSON.parse(stored) : {}
        setState((current) => ({
          ...current,
          ...persisted,
          sessionToken,
          syncStatus: liveApiEnabled ? 'idle' : 'offline',
        }))
      })
      .catch(() => undefined)
      .finally(() => setState((current) => ({ ...current, ready: true })))
  }, [])

  useEffect(() => {
    if (!state.ready) return
    const {
      ready: _ready,
      sessionToken: _sessionToken,
      syncStatus: _syncStatus,
      ...persisted
    } = state
    void AsyncStorage.setItem(storageKey, JSON.stringify(persisted))
  }, [state])

  const runSync = async (task: () => Promise<unknown>) => {
    setState((current) => ({ ...current, syncStatus: 'syncing' }))
    try {
      await task()
      setState((current) => ({ ...current, syncStatus: 'synced' }))
    } catch {
      setState((current) => ({ ...current, syncStatus: 'error' }))
    }
  }

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      liveApiEnabled,
      setLanguage: (language) => setState((current) => ({ ...current, language })),
      connectStudio: (code) => {
        const valid = code.trim().toUpperCase() === 'FIT2026'
        if (valid) setState((current) => ({ ...current, studioCode: 'FIT2026' }))
        return valid
      },
      authenticate: async (input) => {
        const email = input.email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { ok: false, error: 'Bitte gib eine gültige E-Mail ein.' }
        }
        if (input.password.length < 10) {
          return { ok: false, error: 'Das Passwort braucht mindestens 10 Zeichen.' }
        }
        if (
          input.mode === 'register' &&
          (!input.displayName || input.displayName.trim().length < 2)
        ) {
          return { ok: false, error: 'Bitte gib deinen Namen ein.' }
        }
        try {
          let user: AuthUser
          let sessionToken: string
          if (liveApiEnabled) {
            if (!state.studioCode) {
              return { ok: false, error: 'Studio-Code fehlt.' }
            }
            const result = await apiAuthenticate({
              ...input,
              email,
              inviteCode: state.studioCode,
            })
            user = result.user
            sessionToken = result.token
          } else {
            const trainer = email === 'trainer@fitpath.demo'
            user = {
              id: trainer ? 'demo-trainer' : 'demo-member',
              studioId: 'studio-pilot-vaihingen',
              email,
              displayName:
                input.displayName?.trim() || (trainer ? 'Trainer Alex' : 'Mara Klein'),
              role: trainer ? 'trainer' : 'member',
            }
            sessionToken = 'offline-demo-session'
          }
          await storeSession(sessionToken)
          setState((current) => ({
            ...current,
            user,
            sessionToken,
            syncStatus: liveApiEnabled ? 'synced' : 'offline',
          }))
          return { ok: true, user }
        } catch (error) {
          return {
            ok: false,
            error:
              error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.',
          }
        }
      },
      logout: async () => {
        if (liveApiEnabled && state.sessionToken) {
          try {
            await logoutAccount(state.sessionToken)
          } catch {
            // The local session is still removed when the network is unavailable.
          }
        }
        await removeStoredSession()
        setState((current) => ({
          ...initialState,
          language: current.language,
          ready: true,
        }))
      },
      saveOnboarding: (onboarding) => {
        setState((current) => ({ ...current, onboarding }))
        if (liveApiEnabled && state.sessionToken) {
          void runSync(() => syncOnboarding(state.sessionToken!, onboarding))
        }
      },
      activatePlan: (planMode) => {
        setState((current) => ({ ...current, planMode }))
        if (liveApiEnabled && state.sessionToken) {
          void runSync(() => syncPlanMode(state.sessionToken!, planMode))
        }
      },
      saveWorkout: (log) => {
        setState((current) => ({ ...current, logs: [log, ...current.logs] }))
        if (liveApiEnabled && state.sessionToken) {
          void runSync(() => syncWorkout(state.sessionToken!, log))
        }
      },
      reset: () => {
        void AsyncStorage.removeItem(storageKey)
        void removeStoredSession()
        setState({ ...initialState, ready: true })
      },
    }),
    [state],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = React.use(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
