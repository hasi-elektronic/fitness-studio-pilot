import type { PersistedAppState } from './types'

const STORAGE_KEY = 'fitpath-pilot-state-v2'

export const createDefaultState = (): PersistedAppState => ({
  version: 2,
  role: 'member',
  theme: 'dark',
  memberStage: 'invite',
  memberView: 'home',
  onboarding: {},
  planStatus: 'generated',
  planOverrides: {},
  workoutLogs: [],
})

export const loadState = (): PersistedAppState => {
  if (typeof window === 'undefined') return createDefaultState()
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return createDefaultState()
    const parsed = JSON.parse(stored) as Partial<PersistedAppState>
    if (parsed.version !== 2) return createDefaultState()
    return { ...createDefaultState(), ...parsed }
  } catch {
    return createDefaultState()
  }
}

export const saveState = (state: PersistedAppState) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const clearState = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
