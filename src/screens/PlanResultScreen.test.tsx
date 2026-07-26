import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { matchTrainingTemplate } from '../engine'
import type { OnboardingAnswers } from '../types'
import { PlanResultScreen } from './PlanResultScreen'

const answers: OnboardingAnswers = {
  goal: 'general_fitness',
  experience: 'beginner',
  daysPerWeek: 3,
  sessionMinutes: 45,
  focusAreas: ['balanced'],
  outsideActivity: 'walking',
  requiresTrainerReview: false,
}

describe('PlanResultScreen safety gate', () => {
  it('shows both access modes for a regular starter plan', () => {
    render(
      <PlanResultScreen
        answers={answers}
        match={matchTrainingTemplate(answers)}
        onStartStarter={vi.fn()}
        onRequestTrainer={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Einstieg starten' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zur Trainer-Prüfung' })).toBeInTheDocument()
  })

  it('removes immediate access when the member reports uncertainty', () => {
    const restrictedAnswers = { ...answers, requiresTrainerReview: true }
    render(
      <PlanResultScreen
        answers={restrictedAnswers}
        match={matchTrainingTemplate(restrictedAnswers)}
        onStartStarter={vi.fn()}
        onRequestTrainer={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Einstieg starten' })).not.toBeInTheDocument()
    expect(screen.getByText('Trainer-Check vor dem Start')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zur Trainer-Prüfung' })).toBeInTheDocument()
  })
})
