import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  LockKeyhole,
  Route,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react'
import { BrandMark, Button, MachineArtwork, Tag } from '../components/ui'
import type { OnboardingAnswers, TemplateMatchResult } from '../types'

export function PlanResultScreen({
  answers,
  match,
  onStartStarter,
  onRequestTrainer,
}: {
  answers: OnboardingAnswers
  match: TemplateMatchResult
  onStartStarter: () => void
  onRequestTrainer: () => void
}) {
  return (
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-4 pb-12 pt-18 sm:px-6">
      <div className="flex items-center justify-between py-4">
        <BrandMark compact />
        <Tag tone="success">
          <BadgeCheck size={13} className="mr-1" /> Vorlage freigegeben
        </Tag>
      </div>

      <section className="enter pt-5 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]">
          <Sparkles size={30} />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
          Dein Startplan ist bereit
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
          {match.template.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          {match.template.description}
        </p>
      </section>

      <section className="mx-auto mt-9 grid max-w-4xl gap-3 sm:grid-cols-3">
        {[
          { icon: CalendarDays, value: `${answers.daysPerWeek}×`, label: 'pro Woche' },
          { icon: Clock3, value: `${answers.sessionMinutes} Min.`, label: 'pro Einheit' },
          {
            icon: Route,
            value: `${match.weeklyPlan.days.length}`,
            label: 'Trainingstage',
          },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="soft-card flex items-center gap-4 rounded-3xl p-4 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
              <Icon size={20} />
            </span>
            <div>
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-[var(--muted)]">{label}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-9 max-w-4xl">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--primary)]">
            Deine Woche
          </p>
          <h2 className="mt-1 text-xl font-bold">Tage und Schwerpunkte</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {match.weeklyPlan.days.map((day) => (
            <div key={day.id} className="soft-card rounded-3xl p-4 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                {day.label}
              </div>
              <div className="mt-3 text-sm font-bold">{day.weekday}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">{day.focus}</div>
              <div className="mt-3 text-[10px] font-bold text-[var(--primary)]">
                {day.route.items.length} Stationen
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-9 max-w-4xl">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--primary)]">
              {match.weeklyPlan.days[0].label}
            </p>
            <h2 className="mt-1 text-xl font-bold">
              {match.weeklyPlan.days[0].focus}
            </h2>
          </div>
          <span className="text-xs text-[var(--muted)]">kurze Wege</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {match.route.items.map((item) => (
            <div key={item.machine.id} className="soft-card flex items-center gap-4 rounded-3xl p-3">
              <MachineArtwork
                code={item.machine.code}
                name={item.machine.name}
                photoUrl={item.machine.photoUrl}
                size="small"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--primary)] text-[10px] font-black text-[#06151a]">
                    {item.order}
                  </span>
                  <span className="truncate text-sm font-bold">{item.machine.name}</span>
                </div>
                <div className="mt-2 text-xs text-[var(--muted)]">
                  {item.targetSets} Sätze · {item.repMin}–{item.repMax} Wdh.
                </div>
                {item.alternative && (
                  <div className="mt-1 text-[10px] text-[var(--muted)]">
                    Alternative: {item.alternative.code} {item.alternative.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-4xl">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--primary)]">Du entscheidest</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">Wie möchtest du starten?</h2>
        </div>

        {match.safety.requiresTrainerReview && (
          <div className="mb-4 flex gap-3 rounded-3xl border border-[color-mix(in_srgb,var(--warning)_34%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] p-4">
            <LockKeyhole className="mt-0.5 shrink-0 text-[var(--warning)]" size={20} />
            <div>
              <div className="text-sm font-bold">Trainer-Check vor dem Start</div>
              <div className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Weil du eine Einschränkung oder Unsicherheit angegeben hast, wird dein Plan zuerst
                persönlich geprüft. Wir speichern keine Diagnose.
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {!match.safety.requiresTrainerReview && (
            <article className="soft-card flex flex-col rounded-[2rem] p-5">
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary)] text-[#06151a]">
                <ArrowRight size={22} />
              </span>
              <h3 className="text-xl font-bold">Direkt starten</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">
                Nutze sofort die freigegebene Einstiegsvorlage. Ein Trainer kann sie später
                individuell anpassen.
              </p>
              <ul className="my-5 space-y-2 text-xs">
                {['Sofort verfügbar', 'Keine automatische Startgewicht-Schätzung', 'Jederzeit anpassbar'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check size={15} className="text-[var(--success)]" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
              <Button onClick={onStartStarter} className="w-full">
                Einstieg starten
              </Button>
            </article>
          )}

          <article className="soft-card flex flex-col rounded-[2rem] p-5">
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
              <UserRoundCheck size={22} />
            </span>
            <h3 className="text-xl font-bold">Trainer prüfen lassen</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">
              Dein Trainer sieht deine Antworten, passt Stationen und Ziele an und veröffentlicht
              den persönlichen Plan.
            </p>
            <div className="my-5 flex items-start gap-2 rounded-2xl bg-[var(--surface-raised)] p-3 text-xs leading-5 text-[var(--muted)]">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--success)]" />
              Nur Trainingsdaten, keine Diagnose oder automatische Gesundheitsbewertung.
            </div>
            <Button onClick={onRequestTrainer} variant={match.safety.requiresTrainerReview ? 'primary' : 'secondary'} className="w-full">
              Zur Trainer-Prüfung
            </Button>
          </article>
        </div>
      </section>
    </main>
  )
}
