import { machines, trainingTemplates } from './data'
import type {
  Machine,
  MachineRoute,
  MachineRouteItem,
  OnboardingAnswers,
  PlanItemOverride,
  ProgressionTarget,
  TemplateMatchResult,
  TrainingTemplate,
  WeeklyTrainingPlan,
  WorkoutLog,
} from './types'

const machineLimitByDuration: Record<OnboardingAnswers['sessionMinutes'], number> = {
  30: 4,
  45: 5,
  60: 6,
  90: 8,
}

const scoreTemplate = (answers: OnboardingAnswers, template: TrainingTemplate) => {
  let score = 0
  if (template.goals.includes(answers.goal)) score += 55
  if (template.levels.includes(answers.experience)) score += 20
  if (template.supportedDays.includes(answers.daysPerWeek)) score += 10
  if (template.supportedDurations.includes(answers.sessionMinutes)) score += 10
  const cardioActivity = ['running', 'cycling'].includes(answers.outsideActivity)
  if (cardioActivity && template.id === 'active-circuit') score += 5
  if (!cardioActivity && template.id === 'balanced-start') score += 5
  return score
}

const getActiveAlternative = (machine: Machine, inventory: Machine[]) =>
  machine.alternativeIds
    .map((id) => inventory.find((item) => item.id === id))
    .find((item): item is Machine => Boolean(item?.active))

const weekdaysByFrequency: Record<OnboardingAnswers['daysPerWeek'], string[]> = {
  2: ['Montag', 'Donnerstag'],
  3: ['Montag', 'Mittwoch', 'Freitag'],
  4: ['Montag', 'Dienstag', 'Donnerstag', 'Samstag'],
  5: ['Montag', 'Dienstag', 'Mittwoch', 'Freitag', 'Samstag'],
}

export const buildMachineRoute = (
  answers: OnboardingAnswers,
  template: TrainingTemplate,
  inventory: Machine[] = machines,
  machineIds: string[] = template.machineIds,
  routeSuffix = 'Tag A',
): MachineRoute => {
  const activeInventory = inventory.filter((item) => item.active)
  const templateMachines = machineIds
    .map((id) => {
      const plannedMachine = inventory.find((item) => item.id === id)
      if (!plannedMachine) return undefined
      return plannedMachine.active
        ? plannedMachine
        : getActiveAlternative(plannedMachine, inventory)
    })
    .filter((item): item is Machine => Boolean(item))

  const focusMachines = activeInventory.filter(
    (item) =>
      item.muscleGroups.some((group) => answers.focusAreas.includes(group)) &&
      !templateMachines.some((templateMachine) => templateMachine.id === item.id),
  )

  const selected = [...new Map(
    [...templateMachines, ...focusMachines].map((item) => [item.id, item]),
  ).values()]
    .sort((a, b) => a.routeOrder - b.routeOrder)
    .slice(0, machineLimitByDuration[answers.sessionMinutes])

  const items: MachineRouteItem[] = selected.map((machine, index) => ({
    machine,
    order: index + 1,
    targetSets: template.targetSets,
    repMin: template.repMin,
    repMax: template.repMax,
    weightStep: template.weightStep,
    alternative: getActiveAlternative(machine, activeInventory),
  }))

  return {
    id: `${template.id}-${routeSuffix.toLowerCase().replaceAll(' ', '-')}-${answers.sessionMinutes}m`,
    name: `${template.name} · ${routeSuffix}`,
    estimatedMinutes: answers.sessionMinutes,
    items,
  }
}

export const buildWeeklyTrainingPlan = (
  answers: OnboardingAnswers,
  template: TrainingTemplate,
  inventory: Machine[] = machines,
): WeeklyTrainingPlan => {
  const weekdays = weekdaysByFrequency[answers.daysPerWeek]
  const blueprints = template.dayBlueprints.length
    ? template.dayBlueprints
    : [{ id: `${template.id}-base`, name: 'Ganzkörper', machineIds: template.machineIds }]

  const days = weekdays.map((weekday, index) => {
    const blueprint = blueprints[index % blueprints.length]
    const label = `Tag ${String.fromCharCode(65 + index)}`
    return {
      id: `${template.id}-day-${index + 1}`,
      label,
      weekday,
      focus: blueprint.name,
      route: buildMachineRoute(answers, template, inventory, blueprint.machineIds, label),
    }
  })

  return {
    id: `${template.id}-${answers.daysPerWeek}d-${answers.sessionMinutes}m`,
    name: `${template.name} · Wochenplan`,
    days,
  }
}

export const matchTrainingTemplate = (
  answers: OnboardingAnswers,
  inventory: Machine[] = machines,
  templates: TrainingTemplate[] = trainingTemplates,
): TemplateMatchResult => {
  const ranked = [...templates]
    .map((template) => ({ template, score: scoreTemplate(answers, template) }))
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]
  if (!best) throw new Error('Kein freigegebenes Trainingsprogramm verfügbar.')
  const weeklyPlan = buildWeeklyTrainingPlan(answers, best.template, inventory)

  return {
    template: best.template,
    route: weeklyPlan.days[0].route,
    weeklyPlan,
    candidates: ranked.map(({ template, score }) => ({
      templateId: template.id,
      name: template.name,
      score,
      approvedBy: template.approvedBy,
    })),
    score: best.score,
    reasons: [
      `${answers.daysPerWeek} Trainingstage pro Woche`,
      `${answers.sessionMinutes} Minuten pro Einheit`,
      answers.focusAreas.includes('balanced')
        ? 'Ausgewogener Ganzkörperfokus'
        : 'Gewünschte Schwerpunkte berücksichtigt',
    ],
    safety: {
      requiresTrainerReview: answers.requiresTrainerReview,
      canStartStarterPlan: !answers.requiresTrainerReview,
    },
  }
}

export const applyPlanOverrides = (
  route: MachineRoute,
  overrides: Record<string, PlanItemOverride>,
): MachineRoute => ({
  ...route,
  items: route.items.map((item) => {
    const override = overrides[item.machine.id]
    return override ? { ...item, ...override } : item
  }),
})

export const applyWeeklyPlanOverrides = (
  weeklyPlan: WeeklyTrainingPlan,
  overrides: Record<string, PlanItemOverride>,
): WeeklyTrainingPlan => ({
  ...weeklyPlan,
  days: weeklyPlan.days.map((day) => ({
    ...day,
    route: applyPlanOverrides(day.route, overrides),
  })),
})

export const getNextTarget = (
  item: MachineRouteItem,
  latestLog?: WorkoutLog,
): ProgressionTarget | undefined => {
  if (!latestLog) return undefined

  const completedSets = latestLog.reps.length >= item.targetSets
  const allAtUpperLimit =
    completedSets && latestLog.reps.slice(0, item.targetSets).every((reps) => reps >= item.repMax)
  const allAtMinimum =
    completedSets && latestLog.reps.slice(0, item.targetSets).every((reps) => reps >= item.repMin)

  if (allAtUpperLimit) {
    return {
      weightKg: latestLog.weightKg + item.weightStep,
      repsPerSet: item.repMin,
      explanation: `Alle Sätze geschafft: +${item.weightStep.toLocaleString('de-DE')} kg und zurück auf ${item.repMin} Wiederholungen.`,
    }
  }

  if (allAtMinimum) {
    const nextReps = Math.min(item.repMax, Math.min(...latestLog.reps) + 1)
    return {
      weightKg: latestLog.weightKg,
      repsPerSet: nextReps,
      explanation: `Gewicht halten und auf ${nextReps} saubere Wiederholungen pro Satz steigern.`,
    }
  }

  return {
    weightKg: latestLog.weightKg,
    repsPerSet: item.repMin,
    explanation: 'Ziel wiederholen, bis alle vorgesehenen Sätze sauber abgeschlossen sind.',
  }
}

export const validateInviteCode = (code: string, expectedCode: string) =>
  code.trim().toUpperCase() === expectedCode.toUpperCase()

export const resolveMachineFromQr = (decodedText: string, inventory: Machine[] = machines) => {
  const normalized = decodedText.trim().toUpperCase()
  return inventory.find(
    (machine) =>
      normalized === machine.code.toUpperCase() ||
      normalized.endsWith(`/MACHINE/${machine.code.toUpperCase()}`) ||
      normalized.endsWith(`MACHINE=${machine.code.toUpperCase()}`),
  )
}
