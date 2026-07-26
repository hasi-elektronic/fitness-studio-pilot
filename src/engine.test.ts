import { describe, expect, it } from 'vitest'
import { machines, trainingTemplates } from './data'
import {
  buildMachineRoute,
  buildWeeklyTrainingPlan,
  getNextTarget,
  matchTrainingTemplate,
  resolveMachineFromQr,
  validateInviteCode,
} from './engine'
import type {
  ExperienceLevel,
  FocusArea,
  Goal,
  MachineRouteItem,
  OnboardingAnswers,
  OutsideActivity,
  WorkoutLog,
} from './types'

const baseAnswers: OnboardingAnswers = {
  goal: 'general_fitness',
  experience: 'beginner',
  daysPerWeek: 3,
  sessionMinutes: 45,
  focusAreas: ['balanced'],
  outsideActivity: 'walking',
  requiresTrainerReview: false,
}

describe('plan matching', () => {
  it('selects an approved template and only active studio machines', () => {
    const result = matchTrainingTemplate(baseAnswers)
    expect(result.template.id).toBe('balanced-start')
    expect(result.route.items.length).toBe(5)
    expect(result.route.items.every((item) => item.machine.active)).toBe(true)
    expect(result.route.items.every((item) => item.machine.studioId === 'pilot-studio-vaihingen')).toBe(
      true,
    )
    expect(result.weeklyPlan.days).toHaveLength(baseAnswers.daysPerWeek)
    expect(result.weeklyPlan.days.map((day) => day.weekday)).toEqual([
      'Montag',
      'Mittwoch',
      'Freitag',
    ])
  })

  it('routes a safety flag to trainer review', () => {
    const result = matchTrainingTemplate({ ...baseAnswers, requiresTrainerReview: true })
    expect(result.safety.canStartStarterPlan).toBe(false)
    expect(result.safety.requiresTrainerReview).toBe(true)
  })

  it('uses outside activity as a bounded template-matching signal', () => {
    const result = matchTrainingTemplate({
      ...baseAnswers,
      goal: 'weight_control',
      outsideActivity: 'running',
    })
    expect(result.template.id).toBe('active-circuit')
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('replaces an inactive planned machine with its approved active alternative', () => {
    const inventory = machines.map((item) =>
      item.id === 'chest-press' ? { ...item, active: false } : item,
    )
    const route = buildMachineRoute(baseAnswers, trainingTemplates[0], inventory)
    expect(route.items.some((item) => item.machine.id === 'chest-press')).toBe(false)
    expect(route.items.some((item) => item.machine.id === 'butterfly')).toBe(true)
    expect(route.items.every((item) => item.machine.active)).toBe(true)
  })

  it('builds trainer-approved day variants for the selected weekly frequency', () => {
    const weeklyPlan = buildWeeklyTrainingPlan(
      { ...baseAnswers, goal: 'muscle_gain', daysPerWeek: 5, sessionMinutes: 60 },
      trainingTemplates[1],
    )

    expect(weeklyPlan.days).toHaveLength(5)
    expect(weeklyPlan.days.map((day) => day.focus)).toEqual([
      'Unterkörper & Mitte',
      'Oberkörper Zug',
      'Oberkörper Druck',
      'Unterkörper & Mitte',
      'Oberkörper Zug',
    ])
    expect(
      weeklyPlan.days.every((day) => day.route.items.every((item) => item.machine.active)),
    ).toBe(true)
  })

  it('maps every onboarding combination to a usable route or trainer review', () => {
    const goals: Goal[] = ['weight_control', 'muscle_gain', 'endurance', 'general_fitness']
    const levels: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced']
    const days: OnboardingAnswers['daysPerWeek'][] = [2, 3, 4, 5]
    const durations: OnboardingAnswers['sessionMinutes'][] = [30, 45, 60, 90]
    const focuses: FocusArea[] = ['legs', 'back', 'chest', 'shoulders', 'core', 'balanced']
    const activities: OutsideActivity[] = ['none', 'walking', 'running', 'cycling', 'sports']
    const safetyFlags = [false, true]

    let checked = 0
    for (const goal of goals) {
      for (const experience of levels) {
        for (const daysPerWeek of days) {
          for (const sessionMinutes of durations) {
            for (const focusArea of focuses) {
              for (const outsideActivity of activities) {
                for (const requiresTrainerReview of safetyFlags) {
                  const result = matchTrainingTemplate({
                    goal,
                    experience,
                    daysPerWeek,
                    sessionMinutes,
                    focusAreas: [focusArea],
                    outsideActivity,
                    requiresTrainerReview,
                  })

                  expect(result.template.approvedBy).toBeTruthy()
                  expect(result.route.items.length).toBeGreaterThan(0)
                  expect(result.weeklyPlan.days).toHaveLength(daysPerWeek)
                  expect(
                    result.weeklyPlan.days.every((day) => day.route.items.length > 0),
                  ).toBe(true)
                  expect(result.route.items.every((item) => item.machine.active)).toBe(true)
                  expect(result.safety.canStartStarterPlan).toBe(!requiresTrainerReview)
                  checked += 1
                }
              }
            }
          }
        }
      }
    }

    expect(checked).toBe(11520)
  })
})

describe('progression rule', () => {
  const item: MachineRouteItem = {
    machine: machines[0],
    order: 1,
    targetSets: 3,
    repMin: 8,
    repMax: 12,
    weightStep: 2.5,
  }

  const log = (reps: number[]): WorkoutLog => ({
    id: 'log-1',
    dayId: 'balanced-start-day-1',
    machineId: item.machine.id,
    createdAt: new Date().toISOString(),
    weightKg: 40,
    reps,
    volume: 40 * reps.reduce((sum, value) => sum + value, 0),
  })

  it('adds weight after every set reaches the upper rep limit', () => {
    expect(getNextTarget(item, log([12, 12, 12]))).toMatchObject({
      weightKg: 42.5,
      repsPerSet: 8,
    })
  })

  it('adds one repetition while keeping the weight', () => {
    expect(getNextTarget(item, log([10, 10, 10]))).toMatchObject({
      weightKg: 40,
      repsPerSet: 11,
    })
  })

  it('repeats the minimum target when sets are incomplete', () => {
    expect(getNextTarget(item, log([8, 7]))).toMatchObject({
      weightKg: 40,
      repsPerSet: 8,
    })
  })
})

describe('entry and QR helpers', () => {
  it('validates the studio code case-insensitively', () => {
    expect(validateInviteCode(' fit2026 ', 'FIT2026')).toBe(true)
  })

  it('resolves both direct codes and deep links', () => {
    expect(resolveMachineFromQr('M04')?.id).toBe('leg-press')
    expect(resolveMachineFromQr('https://fitpath.test/machine/M12')?.id).toBe('lat-pulldown')
    expect(resolveMachineFromQr('https://fitpath.test/?machine=M07')?.id).toBe('chest-press')
  })
})
