import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { matchTrainingTemplate } from '../engine'
import type { OnboardingAnswers } from '../types'
import { MemberPortal } from './MemberPortal'

const restrictedAnswers: OnboardingAnswers = {
  goal: 'general_fitness',
  experience: 'beginner',
  daysPerWeek: 3,
  sessionMinutes: 45,
  focusAreas: ['balanced'],
  outsideActivity: 'walking',
  requiresTrainerReview: true,
}

describe('MemberPortal trainer lock', () => {
  it('allows the preview but disables every machine while review is pending', () => {
    const match = matchTrainingTemplate(restrictedAnswers)
    render(
      <MemberPortal
        weeklyPlan={match.weeklyPlan}
        template={match.template}
        answers={restrictedAnswers}
        status="pending_trainer_review"
        view="plan"
        logs={[]}
        selectedDayId={match.weeklyPlan.days[0].id}
        onViewChange={vi.fn()}
        onDaySelect={vi.fn()}
        onSelectMachine={vi.fn()}
        onLogWorkout={vi.fn()}
      />,
    )

    expect(screen.getByText('Trainer-Prüfung läuft')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /BeinpresseM04/ })[0]).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Scan' })).not.toBeInTheDocument()
  })
})
