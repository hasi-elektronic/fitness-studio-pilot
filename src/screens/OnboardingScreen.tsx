import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bike,
  BicepsFlexed,
  CalendarDays,
  CircleGauge,
  Clock3,
  Dumbbell,
  Footprints,
  HeartPulse,
  PersonStanding,
  Scale,
  ShieldQuestion,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Users,
  Waves,
} from 'lucide-react'
import { BrandMark, Button, cx } from '../components/ui'
import type {
  ExperienceLevel,
  FocusArea,
  Goal,
  OnboardingAnswers,
  OutsideActivity,
} from '../types'

type Draft = Partial<OnboardingAnswers>
type Choice<T> = { value: T; title: string; detail?: string; icon: LucideIcon }

const goals: Choice<Goal>[] = [
  { value: 'weight_control', title: 'Gewicht kontrollieren', detail: 'Aktiver werden und Routine aufbauen', icon: Scale },
  { value: 'muscle_gain', title: 'Muskeln aufbauen', detail: 'Kraft und Trainingsvolumen steigern', icon: BicepsFlexed },
  { value: 'endurance', title: 'Ausdauer verbessern', detail: 'Länger leistungsfähig bleiben', icon: Waves },
  { value: 'general_fitness', title: 'Allgemein fitter werden', detail: 'Ausgewogen und regelmäßig trainieren', icon: Sparkles },
]

const levels: Choice<ExperienceLevel>[] = [
  { value: 'beginner', title: 'Einsteiger', detail: 'Weniger als 6 Monate Erfahrung', icon: PersonStanding },
  { value: 'intermediate', title: 'Fortgeschritten', detail: 'Regelmäßig seit 6–24 Monaten', icon: Dumbbell },
  { value: 'advanced', title: 'Erfahren', detail: 'Mehr als 2 Jahre strukturiertes Training', icon: Trophy },
]

const focuses: Choice<FocusArea>[] = [
  { value: 'balanced', title: 'Ausgewogen', icon: Target },
  { value: 'legs', title: 'Beine & Po', icon: Footprints },
  { value: 'back', title: 'Rücken', icon: Activity },
  { value: 'chest', title: 'Brust', icon: BicepsFlexed },
  { value: 'shoulders', title: 'Schultern', icon: CircleGauge },
  { value: 'core', title: 'Körpermitte', icon: HeartPulse },
]

const activities: Choice<OutsideActivity>[] = [
  { value: 'none', title: 'Aktuell keine', icon: Timer },
  { value: 'walking', title: 'Spazieren / Wandern', icon: Footprints },
  { value: 'running', title: 'Laufen', icon: Activity },
  { value: 'cycling', title: 'Radfahren', icon: Bike },
  { value: 'sports', title: 'Andere Sportart', icon: Users },
]

const questions = [
  { title: 'Was ist dein Hauptziel?', eyebrow: 'Dein Ziel', icon: Target },
  { title: 'Wie viel Erfahrung hast du?', eyebrow: 'Dein Level', icon: Trophy },
  { title: 'Wie oft möchtest du trainieren?', eyebrow: 'Deine Woche', icon: CalendarDays },
  { title: 'Wie lange dauert eine Einheit?', eyebrow: 'Deine Zeit', icon: Clock3 },
  { title: 'Was möchtest du besonders trainieren?', eyebrow: 'Dein Fokus', icon: BicepsFlexed },
  { title: 'Bist du außerhalb des Studios aktiv?', eyebrow: 'Deine Aktivität', icon: Activity },
  { title: 'Ein kurzer Sicherheitscheck', eyebrow: 'Sicher starten', icon: ShieldQuestion },
]

function ChoiceButton<T extends string | number | boolean>({
  choice,
  selected,
  onClick,
  compact = false,
}: {
  choice: Choice<T>
  selected: boolean
  onClick: () => void
  compact?: boolean
}) {
  const Icon = choice.icon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        'group flex min-h-18 w-full items-center gap-4 rounded-3xl border p-4 text-left transition duration-200 active:scale-[.985]',
        selected
          ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] shadow-[0_0_0_1px_var(--primary)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_38%,transparent)]',
        compact && 'min-h-16',
      )}
    >
      <span
        className={cx(
          'grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition',
          selected
            ? 'bg-[var(--primary)] text-[#07151a]'
            : 'bg-[var(--surface-soft)] text-[var(--muted)] group-hover:text-[var(--primary)]',
        )}
      >
        <Icon width={21} height={21} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{choice.title}</span>
        {choice.detail && <span className="mt-1 block text-xs text-[var(--muted)]">{choice.detail}</span>}
      </span>
      <span
        className={cx(
          'h-5 w-5 rounded-full border-2 transition',
          selected ? 'border-[6px] border-[var(--primary)]' : 'border-[var(--border)]',
        )}
      />
    </button>
  )
}

const isComplete = (draft: Draft): draft is OnboardingAnswers =>
  Boolean(
    draft.goal &&
      draft.experience &&
      draft.daysPerWeek &&
      draft.sessionMinutes &&
      draft.focusAreas?.length &&
      draft.outsideActivity &&
      typeof draft.requiresTrainerReview === 'boolean',
  )

export function OnboardingScreen({
  value,
  onChange,
  onComplete,
}: {
  value: Draft
  onChange: (value: Draft) => void
  onComplete: (answers: OnboardingAnswers) => void
}) {
  const [step, setStep] = useState(0)
  const question = questions[step]
  const QuestionIcon = question.icon

  const patch = (next: Draft) => onChange({ ...value, ...next })

  const canContinue = [
    Boolean(value.goal),
    Boolean(value.experience),
    Boolean(value.daysPerWeek),
    Boolean(value.sessionMinutes),
    Boolean(value.focusAreas?.length),
    Boolean(value.outsideActivity),
    typeof value.requiresTrainerReview === 'boolean',
  ][step]

  const next = () => {
    if (step < questions.length - 1) {
      setStep((current) => current + 1)
      return
    }
    if (isComplete(value)) onComplete(value)
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col px-4 pb-8 pt-18 sm:px-6">
      <div className="flex items-center justify-between py-4">
        <BrandMark compact />
        <div className="text-xs font-bold text-[var(--muted)]">
          {step + 1} <span className="font-normal opacity-60">/ {questions.length}</span>
        </div>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]"
        role="progressbar"
        aria-label="Onboarding-Fortschritt"
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-valuenow={step + 1}
      >
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8 sm:py-12">
        <div key={step} className="enter">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            <QuestionIcon width={17} height={17} />
            {question.eyebrow}
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">{question.title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
            {step === 6
              ? 'Wir fragen keine Diagnose ab. Bei Unsicherheit wird dein Plan direkt von einem Trainer geprüft.'
              : 'Deine Antwort hilft uns, eine passende freigegebene Vorlage und die richtige Maschinenroute zu wählen.'}
          </p>

          <div className={cx('mt-7 grid gap-3', step === 4 && 'sm:grid-cols-2')}>
            {step === 0 &&
              goals.map((choice) => (
                <ChoiceButton
                  key={choice.value}
                  choice={choice}
                  selected={value.goal === choice.value}
                  onClick={() => patch({ goal: choice.value })}
                />
              ))}

            {step === 1 &&
              levels.map((choice) => (
                <ChoiceButton
                  key={choice.value}
                  choice={choice}
                  selected={value.experience === choice.value}
                  onClick={() => patch({ experience: choice.value })}
                />
              ))}

            {step === 2 &&
              ([2, 3, 4, 5] as const).map((days) => (
                <ChoiceButton
                  key={days}
                  choice={{
                    value: days,
                    title: `${days} Tage pro Woche`,
                    detail: days <= 3 ? 'Gut planbar und nachhaltig' : 'Mehr Trainingsvolumen',
                    icon: CalendarDays,
                  }}
                  selected={value.daysPerWeek === days}
                  onClick={() => patch({ daysPerWeek: days })}
                />
              ))}

            {step === 3 &&
              ([30, 45, 60, 90] as const).map((minutes) => (
                <ChoiceButton
                  key={minutes}
                  choice={{
                    value: minutes,
                    title: `${minutes} Minuten`,
                    detail: `${minutes === 30 ? 'Kompakter Zirkel' : minutes >= 60 ? 'Ausführliche Einheit' : 'Fokussierte Einheit'}`,
                    icon: Clock3,
                  }}
                  selected={value.sessionMinutes === minutes}
                  onClick={() => patch({ sessionMinutes: minutes })}
                />
              ))}

            {step === 4 &&
              focuses.map((choice) => {
                const selected = value.focusAreas?.includes(choice.value) ?? false
                return (
                  <ChoiceButton
                    key={choice.value}
                    choice={choice}
                    compact
                    selected={selected}
                    onClick={() => {
                      if (choice.value === 'balanced') {
                        patch({ focusAreas: ['balanced'] })
                        return
                      }
                      const current = (value.focusAreas ?? []).filter((item) => item !== 'balanced')
                      const nextFocus = selected
                        ? current.filter((item) => item !== choice.value)
                        : [...current, choice.value].slice(0, 3)
                      patch({ focusAreas: nextFocus })
                    }}
                  />
                )
              })}

            {step === 5 &&
              activities.map((choice) => (
                <ChoiceButton
                  key={choice.value}
                  choice={choice}
                  selected={value.outsideActivity === choice.value}
                  onClick={() => patch({ outsideActivity: choice.value })}
                />
              ))}

            {step === 6 && (
              <>
                <ChoiceButton
                  choice={{
                    value: false,
                    title: 'Nein, ich kann regulär starten',
                    detail: 'Mir ist keine Einschränkung bekannt.',
                    icon: ShieldQuestion,
                  }}
                  selected={value.requiresTrainerReview === false}
                  onClick={() => patch({ requiresTrainerReview: false })}
                />
                <ChoiceButton
                  choice={{
                    value: true,
                    title: 'Ja oder ich bin unsicher',
                    detail: 'Ein Trainer soll meinen Plan vor dem Start prüfen.',
                    icon: HeartPulse,
                  }}
                  selected={value.requiresTrainerReview === true}
                  onClick={() => patch({ requiresTrainerReview: true })}
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="px-3"
          >
            Zurück
          </Button>
          <Button
            onClick={next}
            disabled={!canContinue}
            icon={ArrowRight}
            className="ml-auto min-w-36"
          >
            {step === questions.length - 1 ? 'Plan erstellen' : 'Weiter'}
          </Button>
        </div>
      </div>
    </main>
  )
}
