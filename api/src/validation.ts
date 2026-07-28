import type { OnboardingInput } from './types'

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const readJson = async (request: Request) => {
  try {
    const value: unknown = await request.json()
    if (!isRecord(value)) throw new Error('Object expected')
    return value
  } catch {
    throw new HttpError(400, 'Ungültige Anfrage.')
  }
}

export const normalizeEmail = (value: unknown) => {
  if (typeof value !== 'string') throw new HttpError(400, 'E-Mail fehlt.')
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new HttpError(400, 'E-Mail ist ungültig.')
  }
  return email
}

export const validatePassword = (value: unknown) => {
  if (typeof value !== 'string' || value.length < 10 || value.length > 128) {
    throw new HttpError(400, 'Passwort muss 10 bis 128 Zeichen haben.')
  }
  return value
}

export const validateDisplayName = (value: unknown) => {
  if (typeof value !== 'string') throw new HttpError(400, 'Name fehlt.')
  const name = value.trim()
  if (name.length < 2 || name.length > 80) {
    throw new HttpError(400, 'Name muss 2 bis 80 Zeichen haben.')
  }
  return name
}

export const validateInviteCode = (value: unknown) => {
  if (typeof value !== 'string') throw new HttpError(400, 'Studio-Code fehlt.')
  const code = value.trim().toUpperCase()
  if (!/^[A-Z0-9-]{4,32}$/.test(code)) {
    throw new HttpError(400, 'Studio-Code ist ungültig.')
  }
  return code
}

export const validateOnboarding = (body: Record<string, unknown>): OnboardingInput => {
  const goals = ['general', 'muscle', 'weight', 'endurance'] as const
  const experiences = ['beginner', 'intermediate', 'advanced'] as const
  const days = [2, 3, 4, 5] as const
  const durations = [30, 45, 60, 90] as const
  if (!goals.includes(body.goal as typeof goals[number])) {
    throw new HttpError(400, 'Ziel ist ungültig.')
  }
  if (!experiences.includes(body.experience as typeof experiences[number])) {
    throw new HttpError(400, 'Erfahrungslevel ist ungültig.')
  }
  if (!days.includes(body.days as typeof days[number])) {
    throw new HttpError(400, 'Trainingstage sind ungültig.')
  }
  if (!durations.includes(body.duration as typeof durations[number])) {
    throw new HttpError(400, 'Trainingsdauer ist ungültig.')
  }
  if (!Array.isArray(body.focus) || body.focus.length === 0 || body.focus.length > 5) {
    throw new HttpError(400, 'Trainingsfokus ist ungültig.')
  }
  if (!body.focus.every((item) => typeof item === 'string' && item.length <= 30)) {
    throw new HttpError(400, 'Trainingsfokus ist ungültig.')
  }
  if (typeof body.activity !== 'string' || body.activity.length > 40) {
    throw new HttpError(400, 'Aktivität ist ungültig.')
  }
  if (typeof body.needsTrainer !== 'boolean') {
    throw new HttpError(400, 'Sicherheitsantwort fehlt.')
  }
  return body as OnboardingInput
}
