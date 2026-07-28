import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import type {
  Language,
  OnboardingAnswers,
  PlanMode,
  WorkoutLog,
} from '../types'

type AppState = {
  language: Language
  studioCode: string | null
  onboarding: OnboardingAnswers | null
  planMode: PlanMode | null
  logs: WorkoutLog[]
  ready: boolean
}

type AppContextValue = AppState & {
  setLanguage: (language: Language) => void
  connectStudio: (code: string) => boolean
  saveOnboarding: (answers: OnboardingAnswers) => void
  activatePlan: (mode: PlanMode) => void
  saveWorkout: (log: WorkoutLog) => void
  reset: () => void
}

const storageKey = 'fitpath-state-v1'

const deviceLanguage = (): Language => {
  const code = getLocales()[0]?.languageCode
  if (code === 'tr' || code === 'en') return code
  return 'de'
}

const initialState: AppState = {
  language: deviceLanguage(),
  studioCode: null,
  onboarding: null,
  planMode: null,
  logs: [],
  ready: false,
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((stored) => {
        if (!stored) return
        setState((current) => ({ ...current, ...JSON.parse(stored) }))
      })
      .finally(() => setState((current) => ({ ...current, ready: true })))
  }, [])

  useEffect(() => {
    if (!state.ready) return
    const { ready: _ready, ...persisted } = state
    void AsyncStorage.setItem(storageKey, JSON.stringify(persisted))
  }, [state])

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setLanguage: (language) => setState((current) => ({ ...current, language })),
      connectStudio: (code) => {
        const valid = code.trim().toUpperCase() === 'FIT2026'
        if (valid) setState((current) => ({ ...current, studioCode: 'FIT2026' }))
        return valid
      },
      saveOnboarding: (onboarding) => setState((current) => ({ ...current, onboarding })),
      activatePlan: (planMode) => setState((current) => ({ ...current, planMode })),
      saveWorkout: (log) =>
        setState((current) => ({ ...current, logs: [log, ...current.logs] })),
      reset: () => {
        void AsyncStorage.removeItem(storageKey)
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

