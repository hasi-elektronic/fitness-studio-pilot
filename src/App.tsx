import { useEffect, useMemo, useState } from 'react'
import { DemoToolbar } from './components/ui'
import { applyWeeklyPlanOverrides, matchTrainingTemplate } from './engine'
import { clearState, createDefaultState, loadState, saveState } from './storage'
import { InviteScreen } from './screens/InviteScreen'
import { MemberPortal } from './screens/MemberPortal'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { PlanResultScreen } from './screens/PlanResultScreen'
import { TrainerPortal } from './screens/TrainerPortal'
import type {
  OnboardingAnswers,
  PersistedAppState,
  PlanItemOverride,
  TrainerReviewRequest,
  WorkoutLog,
} from './types'

const completeAnswers = (
  value: PersistedAppState['onboarding'],
): value is OnboardingAnswers =>
  Boolean(
    value.goal &&
      value.experience &&
      value.daysPerWeek &&
      value.sessionMinutes &&
      value.focusAreas?.length &&
      value.outsideActivity &&
      typeof value.requiresTrainerReview === 'boolean',
  )

export default function App() {
  const [state, setState] = useState<PersistedAppState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    document.documentElement.classList.toggle('light', state.theme === 'light')
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', state.theme === 'light' ? '#f4f7f9' : '#0b0f14')
  }, [state.theme])

  const answers = completeAnswers(state.onboarding) ? state.onboarding : undefined
  const match = useMemo(() => (answers ? matchTrainingTemplate(answers) : undefined), [answers])
  const weeklyPlan = useMemo(
    () =>
      match ? applyWeeklyPlanOverrides(match.weeklyPlan, state.planOverrides) : undefined,
    [match, state.planOverrides],
  )

  const patch = (next: Partial<PersistedAppState>) =>
    setState((current) => ({ ...current, ...next }))

  const requestTrainerReview = () => {
    if (!answers || !match) return
    const request: TrainerReviewRequest = {
      id: crypto.randomUUID(),
      memberName: 'Mara Klein',
      createdAt: new Date().toISOString(),
      answers,
      templateId: match.template.id,
      status: 'pending',
    }
    patch({
      accessMode: 'trainer_review',
      planStatus: 'pending_trainer_review',
      trainerRequest: request,
      memberStage: 'portal',
      memberView: 'waiting',
      selectedDayId: match.weeklyPlan.days[0].id,
    })
  }

  const publishPlan = () => {
    patch({
      planStatus: 'published',
      memberStage: 'portal',
      memberView: 'home',
      trainerRequest: state.trainerRequest
        ? { ...state.trainerRequest, status: 'published' }
        : undefined,
    })
  }

  const resetDemo = () => {
    if (!window.confirm('Möchtest du den gesamten Demo-Ablauf zurücksetzen?')) return
    clearState()
    setState(createDefaultState())
  }

  return (
    <>
      <DemoToolbar
        role={state.role}
        onRoleChange={(role) => patch({ role })}
        theme={state.theme}
        onThemeToggle={() => patch({ theme: state.theme === 'dark' ? 'light' : 'dark' })}
        onReset={resetDemo}
      />

      {state.role === 'trainer' ? (
        <TrainerPortal
          answers={answers}
          weeklyPlan={weeklyPlan}
          template={match?.template}
          candidates={match?.candidates ?? []}
          request={state.trainerRequest}
          planStatus={state.planStatus}
          overrides={state.planOverrides}
          logs={state.workoutLogs}
          onOverrideChange={(machineId: string, value: PlanItemOverride) =>
            patch({ planOverrides: { ...state.planOverrides, [machineId]: value } })
          }
          onPublish={publishPlan}
        />
      ) : state.memberStage === 'invite' ? (
        <InviteScreen onContinue={() => patch({ memberStage: 'onboarding' })} />
      ) : state.memberStage === 'onboarding' ? (
        <OnboardingScreen
          value={state.onboarding}
          onChange={(onboarding) => patch({ onboarding })}
          onComplete={(onboarding) =>
            patch({ onboarding, memberStage: 'plan_result', planStatus: 'generated' })
          }
        />
      ) : state.memberStage === 'plan_result' && answers && match ? (
        <PlanResultScreen
          answers={answers}
          match={match}
          onStartStarter={() =>
            patch({
              accessMode: 'starter',
              planStatus: 'starter_active',
              memberStage: 'portal',
              memberView: 'home',
              selectedDayId: match.weeklyPlan.days[0].id,
            })
          }
          onRequestTrainer={requestTrainerReview}
        />
      ) : answers && match && weeklyPlan ? (
        <MemberPortal
          weeklyPlan={weeklyPlan}
          template={match.template}
          answers={answers}
          status={state.planStatus}
          view={state.memberView}
          logs={state.workoutLogs}
          selectedDayId={state.selectedDayId}
          selectedMachineId={state.selectedMachineId}
          lastWorkoutLogId={state.lastWorkoutLogId}
          onViewChange={(memberView) => patch({ memberView })}
          onDaySelect={(selectedDayId) => patch({ selectedDayId })}
          onSelectMachine={(selectedMachineId) =>
            patch({ selectedMachineId, memberView: 'workout' })
          }
          onLogWorkout={(log: WorkoutLog) =>
            patch({
              workoutLogs: [...state.workoutLogs, log],
              lastWorkoutLogId: log.id,
              memberView: 'summary',
            })
          }
        />
      ) : (
        <InviteScreen onContinue={() => patch({ memberStage: 'onboarding' })} />
      )}
    </>
  )
}
