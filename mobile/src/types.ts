export type Language = 'de' | 'tr' | 'en'
export type Athlete = 'female' | 'male'
export type PlanMode = 'starter' | 'trainer_review'
export type UserRole = 'member' | 'trainer' | 'studio_admin'
export type SyncStatus = 'offline' | 'idle' | 'syncing' | 'synced' | 'error'
export type Goal = 'general' | 'muscle' | 'weight' | 'endurance'
export type Experience = 'beginner' | 'intermediate' | 'advanced'

export type OnboardingAnswers = {
  goal: Goal
  experience: Experience
  days: 2 | 3 | 4 | 5
  duration: 30 | 45 | 60 | 90
  focus: string[]
  activity: string
  needsTrainer: boolean
}

export type Machine = {
  id: string
  number: string
  name: Record<Language, string>
  zone: string
  muscles: Record<Language, string>
  sets: number
  reps: string
  tempo: string
  instructions: Record<Language, string[]>
  safety: Record<Language, string>
}

export type WorkoutLog = {
  machineId: string
  weight: number
  reps: number[]
  completedAt: string
}

export type AuthUser = {
  id: string
  studioId: string
  email: string
  displayName: string
  role: UserRole
}

export type AuthInput = {
  mode: 'login' | 'register'
  email: string
  password: string
  displayName?: string
}

export type TrainerReview = {
  id: string
  planId: string
  safetyFlag: number
  createdAt: string
  userId: string
  displayName: string
  email: string
  templateName: string
}
