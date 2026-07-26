import { lazy, Suspense, useMemo, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Dumbbell,
  Info,
  List,
  LockKeyhole,
  Medal,
  QrCode,
  Route,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  UserRoundCheck,
  Weight,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import {
  BottomNav,
  BrandMark,
  Button,
  MachineArtwork,
  MetricCard,
  ScanBadge,
  Tag,
  cx,
} from '../components/ui'
import { resolveMachineFromQr, getNextTarget } from '../engine'
import type {
  MachineRoute,
  MachineRouteItem,
  MemberView,
  OnboardingAnswers,
  PlanStatus,
  TrainingDayPlan,
  TrainingTemplate,
  WeeklyTrainingPlan,
  WorkoutLog,
} from '../types'

const QrScanner = lazy(() =>
  import('../components/QrScanner').then((module) => ({ default: module.QrScanner })),
)

const goalLabels: Record<OnboardingAnswers['goal'], string> = {
  weight_control: 'Gewicht kontrollieren',
  muscle_gain: 'Muskeln aufbauen',
  endurance: 'Ausdauer verbessern',
  general_fitness: 'Allgemein fitter',
}

function MemberTopbar({ status }: { status: PlanStatus }) {
  return (
    <header className="flex items-center justify-between py-4">
      <BrandMark compact />
      <div className="flex items-center gap-2">
        <div className="hidden text-right sm:block">
          <div className="text-xs font-bold">Mara Klein</div>
          <div className="text-[10px] text-[var(--muted)]">
            {status === 'published' ? 'Persönlicher Plan' : 'Starterplan'}
          </div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(145deg,var(--primary),#1e738d)] text-sm font-black text-[#07151a]">
          MK
        </div>
      </div>
    </header>
  )
}

function WaitingView({
  route,
  onOpenPlan,
}: {
  route: MachineRoute
  onOpenPlan: () => void
}) {
  return (
    <div
      className="enter flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center pb-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-[2rem] bg-[var(--primary)] opacity-10" />
        <span className="relative grid h-20 w-20 place-items-center rounded-[2rem] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))] text-[var(--primary)]">
          <UserRoundCheck size={36} />
        </span>
      </div>
      <Tag tone="warning">
        <Clock3 size={12} className="mr-1" /> Prüfung ausstehend
      </Tag>
      <h1 className="mt-5 max-w-sm text-3xl font-bold tracking-[-0.05em]">
        Dein Trainer prüft gerade deinen Plan.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
        Die passende Vorlage und deine Maschinenroute sind vorbereitet. Sobald der Trainer sie
        veröffentlicht, kannst du direkt am ersten Gerät starten.
      </p>
      <div className="soft-card mt-7 w-full max-w-sm rounded-3xl p-4 text-left">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
            <Route size={20} />
          </span>
          <div>
            <div className="text-sm font-bold">{route.name}</div>
            <div className="mt-1 text-xs text-[var(--muted)]">
              {route.items.length} Stationen · ca. {route.estimatedMinutes} Min.
            </div>
          </div>
        </div>
      </div>
      <Button onClick={onOpenPlan} variant="secondary" className="mt-5">
        Plan-Vorschau öffnen
      </Button>
      <div className="mt-8 flex items-center gap-2 text-[11px] text-[var(--muted)]">
        <ShieldCheck size={14} className="text-[var(--success)]" />
        Keine Diagnose, keine Gesundheitsbewertung
      </div>
    </div>
  )
}

function HomeView({
  activeDay,
  route,
  template,
  answers,
  status,
  logs,
  onView,
  onSelectMachine,
}: {
  activeDay: TrainingDayPlan
  route: MachineRoute
  template: TrainingTemplate
  answers: OnboardingAnswers
  status: PlanStatus
  logs: WorkoutLog[]
  onView: (view: MemberView) => void
  onSelectMachine: (machineId: string) => void
}) {
  const dayLogs = logs.filter((log) => log.dayId === activeDay.id)
  const completedMachineIds = new Set(dayLogs.map((log) => log.machineId))
  const completion = Math.round((completedMachineIds.size / route.items.length) * 100)
  const totalVolume = logs.reduce((sum, log) => sum + log.volume, 0)
  const completedTrainingDays = new Set(logs.map((log) => log.dayId)).size

  return (
    <div className="enter pb-28">
      <section className="pt-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]">
          <Sparkles size={15} />
          {status === 'published' ? 'Vom Trainer freigegeben' : 'Freigegebener Starterplan'}
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.06em]">
          Guten Morgen,
          <br />
          <span className="text-[var(--primary)]">Mara.</span>
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Heute steht {template.name} auf deinem Plan.
        </p>
      </section>

      <section className="relative mt-7 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#162630,#0e171e)] p-5 text-white shadow-[0_25px_60px_rgba(0,0,0,.22)]">
        <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[var(--primary)] opacity-16 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <Tag tone="primary">HEUTE · {activeDay.label.toUpperCase()}</Tag>
            <span className="text-xs text-white/45">{route.estimatedMinutes} Min.</span>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.04em]">{activeDay.focus}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
            <Route size={14} />
            {route.items.length} Stationen in optimierter Reihenfolge
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-[11px]">
              <span className="text-white/50">Einheit abgeschlossen</span>
              <span className="font-bold">{completion}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-white/9"
              role="progressbar"
              aria-label="Einheit abgeschlossen"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion}
            >
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <Button onClick={() => onView('scan')} icon={ScanLine} className="mt-6 w-full sm:w-auto">
            Training starten
          </Button>
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Dein nächster Weg</h2>
          <button
            type="button"
            onClick={() => onView('plan')}
            className="text-xs font-bold text-[var(--primary)]"
          >
            Alle zeigen
          </button>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {route.items.slice(0, 4).map((item) => {
            const done = completedMachineIds.has(item.machine.id)
            return (
              <button
                key={item.machine.id}
                type="button"
                onClick={() => onSelectMachine(item.machine.id)}
                className="soft-card min-w-44 rounded-3xl p-3 text-left transition active:scale-[.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--muted)]">
                    {item.order.toString().padStart(2, '0')}
                  </span>
                  <span
                    className={cx(
                      'grid h-6 w-6 place-items-center rounded-full',
                      done
                        ? 'bg-[var(--success)] text-[#062015]'
                        : 'bg-[var(--surface-soft)] text-[var(--muted)]',
                    )}
                  >
                    {done ? <Check size={13} /> : <ChevronRight size={13} />}
                  </span>
                </div>
                <Dumbbell className="my-6 text-[var(--primary)]" size={27} strokeWidth={1.7} />
                <div className="text-sm font-bold">{item.machine.name}</div>
                <div className="mt-1 text-[10px] text-[var(--muted)]">{item.machine.code}</div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-7 grid grid-cols-2 gap-3">
        <MetricCard
          label="Trainingsvolumen"
          value={totalVolume ? `${Math.round(totalVolume).toLocaleString('de-DE')} kg` : 'Start'}
          detail={logs.length ? 'aus deinen Einträgen' : 'nach dem ersten Satz sichtbar'}
          icon={Weight}
        />
        <MetricCard
          label="Wochenziel"
          value={`${Math.min(completedTrainingDays, answers.daysPerWeek)} / ${answers.daysPerWeek}`}
          detail={goalLabels[answers.goal]}
          icon={Target}
        />
      </section>
    </div>
  )
}

function PlanView({
  weeklyPlan,
  selectedDayId,
  route,
  template,
  answers,
  status,
  logs,
  locked,
  onDaySelect,
  onSelectMachine,
}: {
  weeklyPlan: WeeklyTrainingPlan
  selectedDayId: string
  route: MachineRoute
  template: TrainingTemplate
  answers: OnboardingAnswers
  status: PlanStatus
  logs: WorkoutLog[]
  locked: boolean
  onDaySelect: (dayId: string) => void
  onSelectMachine: (machineId: string) => void
}) {
  const activeDay = weeklyPlan.days.find((day) => day.id === selectedDayId) ?? weeklyPlan.days[0]
  const completed = new Set(
    logs.filter((log) => log.dayId === activeDay.id).map((log) => log.machineId),
  )

  return (
    <div className="enter pb-28">
      <div className="pt-3">
        <Tag tone={status === 'pending_trainer_review' ? 'warning' : 'success'}>
          {status === 'pending_trainer_review' ? 'Trainer-Prüfung läuft' : 'Plan aktiv'}
        </Tag>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.055em]">Dein Trainingsplan</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{template.description}</p>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3">
        {weeklyPlan.days.map((day) => {
          const selected = day.id === activeDay.id
          const completedStations = new Set(
            logs.filter((log) => log.dayId === day.id).map((log) => log.machineId),
          ).size
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onDaySelect(day.id)}
              aria-pressed={selected}
              className={cx(
                'rounded-3xl border p-4 text-left transition active:scale-[.98]',
                selected
                  ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_9%,var(--surface))]'
                  : 'border-[var(--border)] bg-[var(--surface)]',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  {day.label}
                </span>
                {selected && <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />}
              </div>
              <div className="mt-4 text-sm font-bold">{day.weekday}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">{day.focus}</div>
              <div className="mt-3 text-[10px] font-bold text-[var(--primary)]">
                {completedStations} / {day.route.items.length} Stationen
              </div>
            </button>
          )
        })}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
              Maschinenroute
            </div>
            <h2 className="mt-1 text-xl font-bold">
              {activeDay.label} · {activeDay.focus}
            </h2>
          </div>
          <Route className="text-[var(--muted)]" size={22} />
        </div>

        <div className="space-y-3">
          {route.items.map((item, index) => {
            const done = completed.has(item.machine.id)
            return (
              <button
                key={item.machine.id}
                type="button"
                onClick={() => !locked && onSelectMachine(item.machine.id)}
                disabled={locked}
                className="soft-card relative flex w-full items-center gap-4 rounded-3xl p-3 text-left transition active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {index < route.items.length - 1 && (
                  <span className="absolute left-[2.7rem] top-[5.5rem] h-5 w-px bg-[var(--border)]" />
                )}
                <span
                  className={cx(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-black',
                    done
                      ? 'bg-[var(--success)] text-[#062015]'
                      : 'bg-[var(--surface-soft)] text-[var(--primary)]',
                  )}
                >
                  {locked ? <LockKeyhole size={17} /> : done ? <Check size={18} /> : item.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold">{item.machine.name}</span>
                    <span className="text-[10px] font-bold text-[var(--muted)]">{item.machine.code}</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {item.targetSets} × {item.repMin}–{item.repMax} Wdh. · {item.machine.zone}
                  </div>
                </div>
                {locked ? (
                  <LockKeyhole size={17} className="shrink-0 text-[var(--warning)]" />
                ) : (
                  <ChevronRight size={18} className="shrink-0 text-[var(--muted)]" />
                )}
              </button>
            )
          })}
        </div>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-3xl bg-[var(--surface)] p-4 text-xs leading-5 text-[var(--muted)]">
        <Info size={17} className="mt-0.5 shrink-0 text-[var(--primary)]" />
        Das Startgewicht wird nicht automatisch geschätzt. Beginne leicht oder lass es direkt am
        Gerät von einem Trainer festlegen.
      </div>
    </div>
  )
}

function ScanView({
  route,
  onSelectMachine,
}: {
  route: MachineRoute
  onSelectMachine: (machineId: string) => void
}) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [qrError, setQrError] = useState('')
  const [demoQrOpen, setDemoQrOpen] = useState(false)

  const handleDecoded = (value: string) => {
    const machine = resolveMachineFromQr(value, route.items.map((item) => item.machine))
    setScannerOpen(false)
    if (!machine) {
      setQrError('Dieser QR-Code gehört nicht zu deiner aktuellen Maschinenroute.')
      return
    }
    setQrError('')
    onSelectMachine(machine.id)
  }

  return (
    <div className="enter pb-28">
      {scannerOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[70] grid place-items-center bg-[#02080b]/95 p-5">
              <div className="soft-card rounded-3xl px-6 py-5 text-sm text-[var(--muted)]">
                Kamera wird vorbereitet …
              </div>
            </div>
          }
        >
          <QrScanner onDecoded={handleDecoded} onClose={() => setScannerOpen(false)} />
        </Suspense>
      )}

      <section className="flex flex-col items-center pt-7 text-center">
        <ScanBadge />
        <h1 className="mt-6 text-3xl font-bold tracking-[-0.055em]">Welche Maschine ist frei?</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
          Scanne den QR-Code am Gerät. Wenn die Kamera nicht verfügbar ist, wähle die Maschine aus
          deiner Route.
        </p>
        <Button onClick={() => setScannerOpen(true)} icon={ScanLine} className="mt-6 w-full">
          QR-Scanner öffnen
        </Button>
        {qrError && (
          <div
            className="mt-3 w-full rounded-2xl bg-[color-mix(in_srgb,#ff7b72_10%,transparent)] p-3 text-xs font-semibold text-[#ff7b72]"
            role="alert"
          >
            {qrError}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Oder aus dem Plan wählen</h2>
          <List size={19} className="text-[var(--muted)]" />
        </div>
        <div className="space-y-3">
          {route.items.map((item) => (
            <button
              key={item.machine.id}
              type="button"
              onClick={() => onSelectMachine(item.machine.id)}
              className="soft-card flex w-full items-center gap-4 rounded-3xl p-3 text-left transition active:scale-[.99]"
            >
              <MachineArtwork
                code={item.machine.code}
                name={item.machine.name}
                photoUrl={item.machine.photoUrl}
                size="small"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{item.machine.name}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">{item.machine.zone}</div>
                <div className="mt-2 text-[10px] font-bold text-[var(--primary)]">
                  {item.targetSets} × {item.repMin}–{item.repMax} Wdh.
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--muted)]" />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
        <button
          type="button"
          onClick={() => setDemoQrOpen((value) => !value)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <QrCode size={20} className="text-[var(--primary)]" />
            <div>
              <div className="text-sm font-bold">Demo-Etikett M04</div>
              <div className="mt-1 text-[11px] text-[var(--muted)]">Für den Test mit einem zweiten Gerät</div>
            </div>
          </div>
          <ChevronRight size={17} className={cx('transition', demoQrOpen && 'rotate-90')} />
        </button>
        {demoQrOpen && (
          <div className="mt-4 grid place-items-center rounded-2xl bg-white p-5">
            <QRCodeSVG value="https://fitpath.test/machine/M04" size={176} fgColor="#071319" />
          </div>
        )}
      </section>
    </div>
  )
}

function WorkoutView({
  item,
  latestLog,
  onBack,
  onSave,
}: {
  item: MachineRouteItem
  latestLog?: WorkoutLog
  onBack: () => void
  onSave: (weightKg: number, reps: number[]) => void
}) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState<string[]>(Array.from({ length: item.targetSets }, () => ''))
  const nextFromHistory = getNextTarget(item, latestLog)
  const valid =
    Number(weight) > 0 &&
    reps.length === item.targetSets &&
    reps.every((value) => Number(value) > 0 && Number(value) <= 100)

  return (
    <div className="enter pb-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 mt-2 grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--muted)]"
        aria-label="Zurück"
      >
        <ArrowLeft size={20} />
      </button>

      <MachineArtwork
        code={item.machine.code}
        name={item.machine.name}
        photoUrl={item.machine.photoUrl}
      />

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <Tag tone="primary">{item.machine.zone}</Tag>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em]">{item.machine.name}</h1>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
          <Dumbbell size={22} />
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.machine.instruction}</p>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="soft-card rounded-3xl p-4">
          <div className="text-xs text-[var(--muted)]">Heutiges Ziel</div>
          <div className="mt-2 text-xl font-bold">
            {item.targetSets} × {item.repMin}–{item.repMax}
          </div>
          <div className="mt-1 text-[10px] text-[var(--muted)]">saubere Wiederholungen</div>
        </div>
        <div className="soft-card rounded-3xl p-4">
          <div className="text-xs text-[var(--muted)]">Letzter Eintrag</div>
          <div className="mt-2 text-xl font-bold">
            {latestLog ? `${latestLog.weightKg} kg` : 'Noch keiner'}
          </div>
          <div className="mt-1 text-[10px] text-[var(--muted)]">
            {latestLog ? latestLog.reps.join(' · ') : 'leicht starten'}
          </div>
        </div>
      </section>

      {nextFromHistory && (
        <div className="mt-4 flex gap-3 rounded-3xl bg-[color-mix(in_srgb,var(--primary)_9%,var(--surface))] p-4">
          <TrendingUp size={19} className="mt-0.5 shrink-0 text-[var(--primary)]" />
          <div>
            <div className="text-xs font-bold">Freigegebene nächste Stufe</div>
            <div className="mt-1 text-xs leading-5 text-[var(--muted)]">
              {nextFromHistory.weightKg} kg · {nextFromHistory.repsPerSet} Wdh. —{' '}
              {nextFromHistory.explanation}
            </div>
          </div>
        </div>
      )}

      <section className="mt-7">
        <label htmlFor="weight" className="text-xs font-bold text-[var(--muted)]">
          Gewicht in kg
        </label>
        <div className="relative mt-2">
          <input
            id="weight"
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder={latestLog ? String(latestLog.weightKg) : 'selbst eintragen'}
            className="h-16 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 pr-14 text-xl font-bold text-[var(--text)]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted)]">kg</span>
        </div>
        {!latestLog && (
          <div className="mt-2 flex gap-2 text-[10px] leading-4 text-[var(--muted)]">
            <Info size={13} className="mt-0.5 shrink-0 text-[var(--primary)]" />
            FitPath schätzt beim ersten Training kein Startgewicht. Beginne leicht oder frage einen Trainer.
          </div>
        )}

        <div className="mt-6 text-xs font-bold text-[var(--muted)]">Wiederholungen je Satz</div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {reps.map((value, index) => (
            <label key={index} className="block">
              <span className="mb-2 block text-center text-[10px] text-[var(--muted)]">
                Satz {index + 1}
              </span>
              <input
                aria-label={`Wiederholungen Satz ${index + 1}`}
                type="number"
                min="1"
                max="100"
                inputMode="numeric"
                value={value}
                onChange={(event) =>
                  setReps((current) =>
                    current.map((itemValue, itemIndex) =>
                      itemIndex === index ? event.target.value : itemValue,
                    ),
                  )
                }
                placeholder={`${item.repMin}`}
                className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center text-lg font-bold text-[var(--text)]"
              />
            </label>
          ))}
        </div>
      </section>

      <Button
        onClick={() => onSave(Number(weight), reps.map(Number))}
        disabled={!valid}
        icon={Check}
        className="mt-7 w-full"
      >
        Sätze speichern
      </Button>
    </div>
  )
}

function SummaryView({
  item,
  log,
  route,
  onNext,
  onHome,
}: {
  item: MachineRouteItem
  log: WorkoutLog
  route: MachineRoute
  onNext: (machineId: string) => void
  onHome: () => void
}) {
  const nextTarget = getNextTarget(item, log)
  const nextItem = route.items.find((routeItem) => routeItem.order === item.order + 1)

  return (
    <div className="enter flex min-h-[calc(100vh-9rem)] flex-col justify-center pb-12">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[2rem] bg-[var(--success)] text-[#062015] shadow-[0_18px_50px_rgba(93,214,158,.2)]">
        <Check size={36} strokeWidth={2.8} />
      </div>
      <div className="mt-6 text-center">
        <Tag tone="success">Station gespeichert</Tag>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.055em]">Starker, sauberer Schritt.</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {item.machine.name} · {log.weightKg} kg · {log.reps.join(' / ')} Wdh.
        </p>
      </div>

      {nextTarget && (
        <div className="soft-card mt-8 rounded-[2rem] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]">
            <TrendingUp size={17} />
            NÄCHSTES MAL
          </div>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-4xl font-bold tracking-[-0.06em]">{nextTarget.weightKg}</span>
            <span className="mb-1 text-sm font-bold text-[var(--muted)]">kg</span>
            <span className="mb-1 ml-auto text-sm font-bold">
              {item.targetSets} × {nextTarget.repsPerSet}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{nextTarget.explanation}</p>
          <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)] pt-4 text-[10px] text-[var(--muted)]">
            <ShieldCheck size={13} className="text-[var(--success)]" />
            Regel durch Trainer festgelegt · jederzeit änderbar
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {nextItem && (
          <Button onClick={() => onNext(nextItem.machine.id)} icon={ArrowRight}>
            Weiter zu {nextItem.machine.code}
          </Button>
        )}
        <Button onClick={onHome} variant="secondary">
          Zur Übersicht
        </Button>
      </div>
    </div>
  )
}

function ProgressView({
  weeklyPlan,
  answers,
  logs,
}: {
  weeklyPlan: WeeklyTrainingPlan
  answers: OnboardingAnswers
  logs: WorkoutLog[]
}) {
  const totalVolume = logs.reduce((sum, log) => sum + log.volume, 0)
  const totalSets = logs.reduce((sum, log) => sum + log.reps.length, 0)
  const personalBest = logs.reduce((max, log) => Math.max(max, log.weightKg), 0)
  const totalStations = weeklyPlan.days.reduce((sum, day) => sum + day.route.items.length, 0)
  const completedStations = new Set(logs.map((log) => `${log.dayId}:${log.machineId}`)).size
  const completion = Math.min(100, Math.round((completedStations / totalStations) * 100))
  const bars = [18, 34, logs.length ? 62 : 26, logs.length ? 88 : 20, 44, logs.length ? 72 : 14, 28]

  return (
    <div className="enter pb-28">
      <div className="pt-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
          <BarChart3 size={16} />
          Nur gemessene Trainingsdaten
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.055em]">Dein Fortschritt</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Klar, nachvollziehbar und ohne erfundene Körperwerte.
        </p>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3">
        <MetricCard
          label="Gesamtvolumen"
          value={totalVolume ? `${Math.round(totalVolume).toLocaleString('de-DE')} kg` : '0 kg'}
          detail="Gewicht × Wiederholungen"
          icon={Weight}
        />
        <MetricCard label="Arbeitssätze" value={String(totalSets)} detail="von dir eingetragen" icon={Dumbbell} />
        <MetricCard label="Planfortschritt" value={`${completion}%`} detail={`${totalStations} Wochenstationen`} icon={CircleGauge} />
        <MetricCard label="Höchster Eintrag" value={personalBest ? `${personalBest} kg` : '–'} detail="kein Körperwert" icon={Trophy} />
      </section>

      <section className="soft-card mt-6 rounded-[2rem] p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-bold">Trainingsaktivität</div>
            <div className="mt-1 text-xs text-[var(--muted)]">letzte 7 Tage</div>
          </div>
          <Tag tone="primary">{logs.length} Einträge</Tag>
        </div>
        <div className="mt-8 flex h-36 items-end justify-between gap-2">
          {bars.map((height, index) => (
            <div key={index} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div
                className={cx(
                  'w-full rounded-xl transition-all',
                  index === 3 ? 'bg-[var(--primary)]' : 'bg-[var(--surface-soft)]',
                )}
                style={{ height: `${height}%` }}
              />
              <span className="text-center text-[9px] font-bold text-[var(--muted)]">
                {['M', 'D', 'M', 'D', 'F', 'S', 'S'][index]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] bg-[linear-gradient(135deg,#162630,#0e171e)] p-5 text-white">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]">
          <Medal size={17} />
          DEIN FOKUS
        </div>
        <h2 className="mt-4 text-xl font-bold">{goalLabels[answers.goal]}</h2>
        <p className="mt-2 text-xs leading-5 text-white/55">
          FitPath bewertet nur deine dokumentierten Einheiten. Aussagen zu Muskelwachstum oder
          Körperfett werden nicht automatisch erzeugt.
        </p>
      </section>
    </div>
  )
}

export function MemberPortal({
  weeklyPlan,
  template,
  answers,
  status,
  view,
  logs,
  selectedDayId,
  selectedMachineId,
  lastWorkoutLogId,
  onViewChange,
  onDaySelect,
  onSelectMachine,
  onLogWorkout,
}: {
  weeklyPlan: WeeklyTrainingPlan
  template: TrainingTemplate
  answers: OnboardingAnswers
  status: PlanStatus
  view: MemberView
  logs: WorkoutLog[]
  selectedDayId?: string
  selectedMachineId?: string
  lastWorkoutLogId?: string
  onViewChange: (view: MemberView) => void
  onDaySelect: (dayId: string) => void
  onSelectMachine: (machineId: string) => void
  onLogWorkout: (log: WorkoutLog) => void
}) {
  const activeDay =
    weeklyPlan.days.find((day) => day.id === selectedDayId) ?? weeklyPlan.days[0]
  const route = activeDay.route
  const selectedItem = useMemo(
    () => route.items.find((item) => item.machine.id === selectedMachineId),
    [route.items, selectedMachineId],
  )
  const latestMachineLog = selectedItem
    ? [...logs].reverse().find((log) => log.machineId === selectedItem.machine.id)
    : undefined
  const lastLog = logs.find((log) => log.id === lastWorkoutLogId)

  const waiting = status === 'pending_trainer_review'

  return (
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-[520px] px-4 pt-14 sm:px-5">
      <MemberTopbar status={status} />

      {waiting && view !== 'plan' ? (
        <WaitingView route={route} onOpenPlan={() => onViewChange('plan')} />
      ) : view === 'home' ? (
        <HomeView
          activeDay={activeDay}
          route={route}
          template={template}
          answers={answers}
          status={status}
          logs={logs}
          onView={onViewChange}
          onSelectMachine={onSelectMachine}
        />
      ) : view === 'plan' ? (
        <PlanView
          weeklyPlan={weeklyPlan}
          selectedDayId={activeDay.id}
          route={route}
          template={template}
          answers={answers}
          status={status}
          logs={logs}
          locked={waiting}
          onDaySelect={onDaySelect}
          onSelectMachine={onSelectMachine}
        />
      ) : view === 'scan' ? (
        <ScanView route={route} onSelectMachine={onSelectMachine} />
      ) : view === 'workout' && selectedItem ? (
        <WorkoutView
          item={selectedItem}
          latestLog={latestMachineLog}
          onBack={() => onViewChange('scan')}
          onSave={(weightKg, reps) => {
            const log: WorkoutLog = {
              id: crypto.randomUUID(),
              dayId: activeDay.id,
              machineId: selectedItem.machine.id,
              createdAt: new Date().toISOString(),
              weightKg,
              reps,
              volume: weightKg * reps.reduce((sum, value) => sum + value, 0),
            }
            onLogWorkout(log)
          }}
        />
      ) : view === 'summary' && selectedItem && lastLog ? (
        <SummaryView
          item={selectedItem}
          log={lastLog}
          route={route}
          onNext={onSelectMachine}
          onHome={() => onViewChange('home')}
        />
      ) : (
        <ProgressView weeklyPlan={weeklyPlan} answers={answers} logs={logs} />
      )}

      {!['workout', 'summary'].includes(view) && !waiting && (
        <BottomNav view={view} onChange={onViewChange} />
      )}
    </main>
  )
}
