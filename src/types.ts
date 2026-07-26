export type Goal = 'weight_control' | 'muscle_gain' | 'endurance' | 'general_fitness'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type FocusArea = 'legs' | 'back' | 'chest' | 'shoulders' | 'core' | 'balanced'
export type OutsideActivity = 'none' | 'walking' | 'running' | 'cycling' | 'sports'
export type PlanAccessMode = 'starter' | 'trainer_review'
export type PlanStatus =
  | 'generated'
  | 'starter_active'
  | 'pending_trainer_review'
  | 'published'
  | 'locked'
export type UserRole = 'member' | 'trainer'
export type MemberStage = 'invite' | 'onboarding' | 'plan_result' | 'portal'
export type MemberView =
  | 'home'
  | 'plan'
  | 'scan'
  | 'progress'
  | 'workout'
  | 'summary'
  | 'waiting'

export interface StudioTheme {
  studioId: string
  productName: string
  studioName: string
  location: string
  inviteCode: string
  primary: string
  accent: string
}

export interface OnboardingAnswers {
  goal: Goal
  experience: ExperienceLevel
  daysPerWeek: 2 | 3 | 4 | 5
  sessionMinutes: 30 | 45 | 60 | 90
  focusAreas: FocusArea[]
  outsideActivity: OutsideActivity
  requiresTrainerReview: boolean
}

export interface SafetyGateResult {
  requiresTrainerReview: boolean
  canStartStarterPlan: boolean
}

export type MachineMotion =
  | 'diagonal-press'
  | 'vertical-press'
  | 'horizontal-press'
  | 'horizontal-pull'
  | 'vertical-pull'
  | 'arc-close'
  | 'curl'
  | 'crunch'
  | 'extension'

export interface MachineGuide {
  summary: string
  steps: Array<{ title: string; detail: string }>
  targetMuscles: string
  tempo: string
  breathing: string
  rangeOfMotion: string
  setup: string
  commonMistakes: string[]
  safetyNotes: string[]
  motion: MachineMotion
}

export interface Machine {
  studioId: string
  id: string
  code: string
  name: string
  photoUrl: string
  zone: string
  muscleGroups: FocusArea[]
  active: boolean
  routeOrder: number
  alternativeIds: string[]
  instruction: string
  guide: MachineGuide
}

export interface TrainingTemplate {
  studioId: string
  id: string
  name: string
  description: string
  goals: Goal[]
  levels: ExperienceLevel[]
  supportedDays: number[]
  supportedDurations: number[]
  machineIds: string[]
  dayBlueprints: TrainingDayBlueprint[]
  targetSets: number
  repMin: number
  repMax: number
  weightStep: number
  approvedBy: string
}

export interface TrainingDayBlueprint {
  id: string
  name: string
  machineIds: string[]
}

export interface MachineRouteItem {
  machine: Machine
  order: number
  targetSets: number
  repMin: number
  repMax: number
  weightStep: number
  alternative?: Machine
}

export interface MachineRoute {
  id: string
  name: string
  estimatedMinutes: number
  items: MachineRouteItem[]
}

export interface TrainingDayPlan {
  id: string
  label: string
  weekday: string
  focus: string
  route: MachineRoute
}

export interface WeeklyTrainingPlan {
  id: string
  name: string
  days: TrainingDayPlan[]
}

export interface TemplateCandidate {
  templateId: string
  name: string
  score: number
  approvedBy: string
}

export interface TemplateMatchResult {
  template: TrainingTemplate
  route: MachineRoute
  weeklyPlan: WeeklyTrainingPlan
  candidates: TemplateCandidate[]
  score: number
  reasons: string[]
  safety: SafetyGateResult
}

export interface PlanItemOverride {
  targetSets: number
  repMin: number
  repMax: number
  weightStep: number
}

export interface TrainerReviewRequest {
  id: string
  memberName: string
  createdAt: string
  answers: OnboardingAnswers
  templateId: string
  status: 'pending' | 'published'
}

export interface WorkoutLog {
  id: string
  dayId: string
  machineId: string
  createdAt: string
  weightKg: number
  reps: number[]
  volume: number
}

export interface ProgressionTarget {
  weightKg: number
  repsPerSet: number
  explanation: string
}

export interface PersistedAppState {
  version: 3
  role: UserRole
  theme: 'dark' | 'light'
  memberStage: MemberStage
  memberView: MemberView
  onboarding: Partial<OnboardingAnswers>
  planStatus: PlanStatus
  accessMode?: PlanAccessMode
  trainerRequest?: TrainerReviewRequest
  planOverrides: Record<string, PlanItemOverride>
  workoutLogs: WorkoutLog[]
  selectedDayId?: string
  selectedMachineId?: string
  lastWorkoutLogId?: string
}
