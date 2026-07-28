import { describe, expect, it } from 'vitest'
import {
  HttpError,
  normalizeEmail,
  validateOnboarding,
  validatePassword,
} from '../src/validation'

describe('request validation', () => {
  it('normalizes e-mail and enforces password length', () => {
    expect(normalizeEmail('  Mara@Example.DE ')).toBe('mara@example.de')
    expect(() => validatePassword('kurz')).toThrow(HttpError)
  })

  it('accepts a safe onboarding payload without diagnosis data', () => {
    expect(
      validateOnboarding({
        goal: 'general',
        experience: 'beginner',
        days: 2,
        duration: 45,
        focus: ['balanced'],
        activity: 'walking',
        needsTrainer: false,
      }),
    ).toMatchObject({ duration: 45, needsTrainer: false })
  })

  it('rejects invalid onboarding combinations', () => {
    expect(() =>
      validateOnboarding({
        goal: 'general',
        experience: 'beginner',
        days: 7,
        duration: 45,
        focus: [],
        activity: 'none',
        needsTrainer: false,
      }),
    ).toThrow(HttpError)
  })
})
