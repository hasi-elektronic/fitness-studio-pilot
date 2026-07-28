import type {
  AuthInput,
  AuthUser,
  OnboardingAnswers,
  PlanMode,
  WorkoutLog,
  TrainerReview,
} from './types'

const configuredBaseUrl = process.env.EXPO_PUBLIC_FITPATH_API_URL?.replace(/\/$/, '')

export const liveApiEnabled = Boolean(configuredBaseUrl)
export const apiBaseUrl = configuredBaseUrl ?? null

type AuthResponse = {
  token: string
  user: AuthUser
}

const request = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> => {
  if (!configuredBaseUrl) throw new Error('FitPath API ist nicht konfiguriert.')
  const response = await fetch(`${configuredBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(body.error ?? 'Verbindung fehlgeschlagen.')
  }
  return body
}

export const authenticateAccount = (
  input: AuthInput & { inviteCode: string },
) =>
  request<AuthResponse>(
    input.mode === 'register' ? '/v1/auth/register' : '/v1/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        inviteCode: input.inviteCode,
      }),
    },
  )

export const syncOnboarding = (
  token: string,
  answers: OnboardingAnswers,
) =>
  request<{ plan: unknown }>(
    '/v1/onboarding',
    { method: 'POST', body: JSON.stringify(answers) },
    token,
  )

export const syncPlanMode = (token: string, mode: PlanMode) =>
  request<{ plan: unknown }>(
    '/v1/plans/activate',
    { method: 'POST', body: JSON.stringify({ mode }) },
    token,
  )

export const syncWorkout = (token: string, log: WorkoutLog) =>
  request<{ id: string }>(
    '/v1/workouts',
    {
      method: 'POST',
      body: JSON.stringify({
        machineId: log.machineId,
        weight: log.weight,
        reps: log.reps,
        completedAt: log.completedAt,
      }),
    },
    token,
  )

export const logoutAccount = (token: string) =>
  request<{ ok: boolean }>('/v1/auth/logout', { method: 'POST' }, token)

export const getTrainerReviews = (token: string) =>
  request<{ reviews: TrainerReview[] }>('/v1/trainer/reviews', {}, token)

export const publishTrainerReview = (token: string, reviewId: string) =>
  request<{ ok: boolean }>(
    `/v1/trainer/reviews/${encodeURIComponent(reviewId)}/publish`,
    { method: 'POST' },
    token,
  )
