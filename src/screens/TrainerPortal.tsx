import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Dumbbell,
  ListFilter,
  LockKeyhole,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { BrandMark, Button, Tag, cx } from '../components/ui'
import type {
  OnboardingAnswers,
  PlanItemOverride,
  PlanStatus,
  TrainerReviewRequest,
  TemplateCandidate,
  TrainingTemplate,
  WeeklyTrainingPlan,
  WorkoutLog,
} from '../types'

const answerLabels = {
  weight_control: 'Gewicht kontrollieren',
  muscle_gain: 'Muskeln aufbauen',
  endurance: 'Ausdauer',
  general_fitness: 'Allgemeine Fitness',
  beginner: 'Einsteiger',
  intermediate: 'Fortgeschritten',
  advanced: 'Erfahren',
}

function Sidebar() {
  return (
    <aside className="hidden min-h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-5 lg:block">
      <BrandMark />
      <nav className="mt-12 space-y-2">
        {[
          { label: 'Übersicht', icon: BarChart3, active: true },
          { label: 'Mitglieder', icon: Users },
          { label: 'Trainingspläne', icon: CalendarDays },
          { label: 'Geräte', icon: Dumbbell },
        ].map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={cx(
              'flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition',
              active
                ? 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]'
                : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]',
            )}
          >
            <Icon size={19} />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-24">
        <div className="rounded-3xl bg-[var(--surface-raised)] p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--primary)] text-xs font-black text-[#06151a]">
              JS
            </span>
            <div>
              <div className="text-xs font-bold">Jonas Schmid</div>
              <div className="mt-1 text-[10px] text-[var(--muted)]">Trainer · Pilot Studio</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function TrainerPortal({
  answers,
  weeklyPlan,
  template,
  candidates,
  request,
  planStatus,
  overrides,
  logs,
  onOverrideChange,
  onPublish,
}: {
  answers?: OnboardingAnswers
  weeklyPlan?: WeeklyTrainingPlan
  template?: TrainingTemplate
  candidates: TemplateCandidate[]
  request?: TrainerReviewRequest
  planStatus: PlanStatus
  overrides: Record<string, PlanItemOverride>
  logs: WorkoutLog[]
  onOverrideChange: (machineId: string, value: PlanItemOverride) => void
  onPublish: () => void
}) {
  const needsReview = planStatus === 'pending_trainer_review'
  const [selectedDayId, setSelectedDayId] = useState<string>()
  const activeDay =
    weeklyPlan?.days.find((day) => day.id === selectedDayId) ?? weeklyPlan?.days[0]
  const route = activeDay?.route
  const invalidPlan = Boolean(
    weeklyPlan?.days.some((day) =>
      day.route.items.some((item) => {
        const current = overrides[item.machine.id] ?? item
        return (
          current.targetSets < 1 ||
          current.repMin < 1 ||
          current.repMax < current.repMin ||
          current.weightStep <= 0
        )
      }),
    ),
  )

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] pt-14">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-18 items-center justify-between border-b border-[var(--border)] px-4 sm:px-7">
          <div className="lg:hidden">
            <BrandMark compact />
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-bold">Trainer Cockpit</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">Samstag, 26. Juli</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--muted)]"
              aria-label="Benachrichtigungen"
            >
              <Bell size={18} />
            </button>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--primary)] text-xs font-black text-[#06151a]">
              JS
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 pb-12 sm:p-7">
          <section className="enter">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-[var(--primary)]">
                  <Sparkles size={15} />
                  Heute im Studio
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-[-0.055em]">Guten Morgen, Jonas.</h1>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {needsReview ? 'Ein Plan wartet auf deine Freigabe.' : 'Alle Pläne sind aktuell.'}
                </p>
              </div>
              <Button icon={ListFilter} variant="secondary">
                Aufgaben filtern
              </Button>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Offene Prüfungen', value: needsReview ? '1' : '0', icon: Clock3, tone: 'warning' },
                { label: 'Aktive Mitglieder', value: '128', icon: Users, tone: 'primary' },
                { label: 'Einheiten heute', value: String(18 + logs.length), icon: Activity, tone: 'success' },
                { label: 'Plan-Abschluss', value: '74%', icon: CircleGauge, tone: 'primary' },
              ].map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className="soft-card rounded-3xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
                    <span
                      className={cx(
                        'grid h-9 w-9 place-items-center rounded-2xl',
                        tone === 'warning'
                          ? 'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]'
                          : tone === 'success'
                            ? 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]'
                            : 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]',
                      )}
                    >
                      <Icon size={18} />
                    </span>
                  </div>
                  <div className="mt-6 text-3xl font-bold tracking-[-0.06em]">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[.78fr_1.22fr]">
            <div className="soft-card rounded-[2rem] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Mitglieder</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">Planstatus und letzte Aktivität</p>
                </div>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--surface-raised)] text-[var(--muted)]"
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {[
                  {
                    initials: 'MK',
                    name: 'Mara Klein',
                    detail: needsReview ? 'Planprüfung angefragt' : planStatus === 'starter_active' ? 'Starterplan aktiv' : 'Plan freigegeben',
                    active: true,
                    warning: needsReview,
                  },
                  { initials: 'LB', name: 'Leon Bauer', detail: 'Heute · 08:42', active: false },
                  { initials: 'SF', name: 'Sofia Fischer', detail: 'Gestern · Plan B', active: false },
                ].map((member) => (
                  <button
                    key={member.name}
                    type="button"
                    className={cx(
                      'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition',
                      member.active
                        ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface))]'
                        : 'border-transparent hover:bg-[var(--surface-raised)]',
                    )}
                  >
                    <span
                      className={cx(
                        'grid h-10 w-10 place-items-center rounded-2xl text-xs font-black',
                        member.active
                          ? 'bg-[var(--primary)] text-[#06151a]'
                          : 'bg-[var(--surface-soft)] text-[var(--muted)]',
                      )}
                    >
                      {member.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{member.name}</span>
                      <span
                        className={cx(
                          'mt-1 block text-[10px]',
                          member.warning ? 'font-bold text-[var(--warning)]' : 'text-[var(--muted)]',
                        )}
                      >
                        {member.detail}
                      </span>
                    </span>
                    <ChevronRight size={17} className="text-[var(--muted)]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="soft-card rounded-[2rem] p-4 sm:p-6">
              {!answers || !weeklyPlan || !activeDay || !route || !template ? (
                <div className="grid min-h-96 place-items-center text-center">
                  <div>
                    <UserRound className="mx-auto text-[var(--muted)]" size={42} />
                    <h2 className="mt-4 text-xl font-bold">Noch kein Mitgliedsprofil</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Wechsle zur Mitgliedsansicht und schließe das Onboarding ab.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">Mara Klein</h2>
                        <Tag tone={needsReview ? 'warning' : 'success'}>
                          {needsReview ? 'Prüfung offen' : 'Plan aktiv'}
                        </Tag>
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        {request?.createdAt
                          ? `Anfrage ${new Date(request.createdAt).toLocaleString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : 'Freigegebene Einstiegsvorlage'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--surface-raised)] text-[var(--muted)]"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Ziel', value: answerLabels[answers.goal] },
                      { label: 'Level', value: answerLabels[answers.experience] },
                      { label: 'Woche', value: `${answers.daysPerWeek} Tage` },
                      { label: 'Einheit', value: `${answers.sessionMinutes} Min.` },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-[var(--surface-raised)] p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          {item.label}
                        </div>
                        <div className="mt-2 text-xs font-bold">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {answers.requiresTrainerReview && (
                    <div className="mt-4 flex gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--warning)_9%,transparent)] p-3">
                      <LockKeyhole size={18} className="mt-0.5 shrink-0 text-[var(--warning)]" />
                      <div className="text-xs leading-5 text-[var(--muted)]">
                        Mitglied hat Unsicherheit angegeben. Keine Diagnose gespeichert; persönliches
                        Startgespräch erforderlich.
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                        Vorgeschlagene Vorlage
                      </div>
                      <div className="mt-1 text-lg font-bold">{template.name}</div>
                    </div>
                    <Tag tone="primary">{weeklyPlan.days.length} Trainingstage</Tag>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold">Vorlagenvergleich</div>
                        <div className="mt-1 text-[10px] text-[var(--muted)]">
                          Regelbasierte Übereinstimmung
                        </div>
                      </div>
                      <Tag tone="primary">max. 100 Punkte</Tag>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {candidates.map((candidate) => {
                        const selected = candidate.templateId === template.id
                        return (
                          <div
                            key={candidate.templateId}
                            className={cx(
                              'rounded-2xl border p-3',
                              selected
                                ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface))]'
                                : 'border-[var(--border)] bg-[var(--surface)]',
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-[11px] font-bold">
                                {candidate.name}
                              </span>
                              <span className="text-xs font-black text-[var(--primary)]">
                                {candidate.score}
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                              <div
                                className="h-full rounded-full bg-[var(--primary)]"
                                style={{ width: `${candidate.score}%` }}
                                role="progressbar"
                                aria-label={`${candidate.name} Übereinstimmung`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={candidate.score}
                              />
                            </div>
                            <div className="mt-2 text-[9px] text-[var(--muted)]">
                              {selected ? 'Ausgewählte Vorlage' : 'Freigegebene Alternative'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                    {weeklyPlan.days.map((day) => {
                      const selected = day.id === activeDay.id
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => setSelectedDayId(day.id)}
                          aria-pressed={selected}
                          className={cx(
                            'min-w-32 rounded-2xl border px-3 py-3 text-left transition',
                            selected
                              ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_9%,var(--surface))]'
                              : 'border-[var(--border)] bg-[var(--surface-raised)]',
                          )}
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            {day.label} · {day.weekday}
                          </span>
                          <span className="mt-1 block text-xs font-bold">{day.focus}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-4 space-y-2">
                    {route.items.map((item) => {
                      const current = overrides[item.machine.id] ?? {
                        targetSets: item.targetSets,
                        repMin: item.repMin,
                        repMax: item.repMax,
                        weightStep: item.weightStep,
                      }
                      return (
                        <div
                          key={item.machine.id}
                          className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-3 sm:grid-cols-[1fr_auto]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-[11px] font-black text-[var(--primary)]">
                              {item.machine.code}
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-bold">{item.machine.name}</div>
                              <div className="mt-1 text-[10px] text-[var(--muted)]">{item.machine.zone}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { key: 'targetSets', label: 'Sätze', value: current.targetSets, step: 1 },
                              { key: 'repMin', label: 'Min.', value: current.repMin, step: 1 },
                              { key: 'repMax', label: 'Max.', value: current.repMax, step: 1 },
                              { key: 'weightStep', label: '+ kg', value: current.weightStep, step: 0.5 },
                            ].map((field) => (
                              <label key={field.key} className="text-center">
                                <span className="mb-1 block text-[9px] text-[var(--muted)]">{field.label}</span>
                                <input
                                  type="number"
                                  min={field.key === 'weightStep' ? 0.5 : 1}
                                  step={field.step}
                                  value={field.value}
                                  onChange={(event) => {
                                    const value = Number(event.target.value)
                                    onOverrideChange(item.machine.id, {
                                      ...current,
                                      [field.key]: value,
                                    })
                                  }}
                                  className="h-9 w-13 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center text-xs font-bold text-[var(--text)]"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-5">
                    <div className="mr-auto flex items-center gap-2 text-[10px] text-[var(--muted)]">
                      <ShieldCheck size={14} className="text-[var(--success)]" />
                      Regelbasiert · keine freie KI
                    </div>
                    {invalidPlan && (
                      <div
                        className="w-full rounded-2xl bg-[color-mix(in_srgb,#ff7b72_10%,transparent)] p-3 text-xs font-semibold text-[#ff7b72]"
                        role="alert"
                      >
                        Min./Max.-Werte und Steigerungsschritte müssen gültig sein.
                      </div>
                    )}
                    <Button onClick={onPublish} icon={BadgeCheck} disabled={invalidPlan}>
                      Plan veröffentlichen
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
