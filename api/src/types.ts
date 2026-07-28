export type UserRole = 'member' | 'trainer' | 'studio_admin'

export interface Env {
  DB: D1Database
  ENVIRONMENT: string
  CORS_ORIGINS: string
}

export type SessionUser = {
  id: string
  studioId: string
  email: string
  displayName: string
  role: UserRole
}

export type OnboardingInput = {
  goal: 'general' | 'muscle' | 'weight' | 'endurance'
  experience: 'beginner' | 'intermediate' | 'advanced'
  days: 2 | 3 | 4 | 5
  duration: 30 | 45 | 60 | 90
  focus: string[]
  activity: string
  needsTrainer: boolean
}
