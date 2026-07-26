import { useState } from 'react'
import {
  CircleCheck,
  CirclePause,
  CirclePlay,
  Gauge,
  MoveUpRight,
  Ruler,
  Settings2,
  ShieldCheck,
  Target,
  TriangleAlert,
  Wind,
} from 'lucide-react'
import type { Machine } from '../types'
import { Button, cx } from './ui'

type GuideTab = 'instructions' | 'technique' | 'safety'

const tabs: Array<{ id: GuideTab; label: string }> = [
  { id: 'instructions', label: 'Anleitung' },
  { id: 'technique', label: 'Technik' },
  { id: 'safety', label: 'Sicherheit' },
]

const motionLabels: Record<Machine['guide']['motion'], string> = {
  'diagonal-press': 'Schräg nach oben drücken',
  'vertical-press': 'Kontrolliert nach oben drücken',
  'horizontal-press': 'Gerade nach vorn drücken',
  'horizontal-pull': 'Zum Körper ziehen',
  'vertical-pull': 'Nach unten ziehen',
  'arc-close': 'Arme bogenförmig schließen',
  curl: 'Unterschenkel beugen',
  crunch: 'Rumpf kontrolliert einrollen',
  extension: 'Bis zur neutralen Position aufrichten',
}

function MotionDemo({ machine }: { machine: Machine }) {
  const [playing, setPlaying] = useState(true)

  return (
    <section
      className="machine-demo relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[#080d11]"
      aria-label={`Bewegungsanimation für ${machine.name}`}
    >
      <div
        className={cx(
          'exercise-sequence relative aspect-square min-h-72',
          !playing && 'exercise-sequence--paused',
        )}
      >
        <img
          src={`/guides/${machine.id}-start.webp`}
          alt={`${machine.name} in der Ausgangsposition`}
          className="exercise-frame exercise-frame--start absolute inset-0 h-full w-full object-cover"
        />
        <img
          src={`/guides/${machine.id}-end.webp`}
          alt=""
          className="exercise-frame exercise-frame--end absolute inset-0 h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(5,10,14,.96))]" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-sm">
          <span className="exercise-status-dot h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span className="exercise-label exercise-label--start text-[9px] font-bold uppercase tracking-[0.13em] text-white/75">
            Startposition
          </span>
          <span className="exercise-label exercise-label--end absolute left-8 text-[9px] font-bold uppercase tracking-[0.13em] text-white/75">
            Endposition
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--primary)_55%,transparent)] bg-[#07151a]/90 text-[var(--primary)]"
            aria-label={playing ? 'Animation pausieren' : 'Animation abspielen'}
          >
            {playing ? <CirclePause size={25} /> : <CirclePlay size={25} />}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
              <MoveUpRight size={13} />
              Bewegungsablauf
            </div>
            <div className="mt-1 truncate text-xs font-bold text-white">
              {motionLabels[machine.guide.motion]}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Instructions({ machine }: { machine: Machine }) {
  return (
    <div className="space-y-0">
      {machine.guide.steps.map((step, index) => (
        <div key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-3">
          <div className="flex flex-col items-center">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--primary)] text-sm font-black text-[var(--primary)]">
              {index + 1}
            </span>
            {index < machine.guide.steps.length - 1 ? (
              <span className="h-full w-px bg-[color-mix(in_srgb,var(--primary)_38%,transparent)]" />
            ) : null}
          </div>
          <div className={cx('pb-5', index > 0 && 'pt-0.5')}>
            <div className="text-sm font-bold">{step.title}</div>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Technique({ machine }: { machine: Machine }) {
  const rows = [
    { icon: Settings2, label: 'Einstellung', value: machine.guide.setup },
    { icon: Ruler, label: 'Bewegungsumfang', value: machine.guide.rangeOfMotion },
    { icon: Gauge, label: 'Tempo', value: `${machine.guide.tempo} · hin – halten – zurück` },
    { icon: Wind, label: 'Atmung', value: machine.guide.breathing },
  ]

  return (
    <div className="divide-y divide-[var(--border)]">
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--primary)]">
            <Icon size={17} />
          </span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--muted)]">
              {label}
            </div>
            <div className="mt-1 text-xs font-semibold leading-5">{value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Safety({ machine }: { machine: Machine }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--warning)]">
          <TriangleAlert size={16} />
          Häufige Fehler
        </div>
        <div className="mt-3 space-y-2">
          {machine.guide.commonMistakes.map((mistake) => (
            <div key={mistake} className="flex gap-2 text-xs leading-5 text-[var(--muted)]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" />
              {mistake}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[var(--border)] pt-5">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--success)]">
          <ShieldCheck size={16} />
          Sicher trainieren
        </div>
        <div className="mt-3 space-y-2">
          {machine.guide.safetyNotes.map((note) => (
            <div key={note} className="flex gap-2 text-xs leading-5 text-[var(--muted)]">
              <CircleCheck size={15} className="mt-0.5 shrink-0 text-[var(--success)]" />
              {note}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MachineGuidePanel({
  machine,
  onStart,
}: {
  machine: Machine
  onStart: () => void
}) {
  const [tab, setTab] = useState<GuideTab>('instructions')

  return (
    <div>
      <MotionDemo machine={machine} />

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{machine.guide.summary}</p>

      <section className="mt-5">
        <div
          className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
          role="tablist"
          aria-label="Maschineninformationen"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cx(
                'min-h-12 border-b-2 px-2 text-[10px] font-bold uppercase tracking-[0.08em] transition',
                tab === item.id
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="soft-card mt-3 rounded-[2rem] p-5" role="tabpanel">
          {tab === 'instructions' ? (
            <Instructions machine={machine} />
          ) : tab === 'technique' ? (
            <Technique machine={machine} />
          ) : (
            <Safety machine={machine} />
          )}
        </div>
      </section>

      <section className="soft-card mt-3 grid grid-cols-3 divide-x divide-[var(--border)] rounded-[2rem] px-2 py-4 text-center">
        <div className="px-2">
          <Target size={18} className="mx-auto text-[var(--primary)]" />
          <div className="mt-2 text-[9px] text-[var(--muted)]">Zielmuskeln</div>
          <div className="mt-1 text-[10px] font-bold leading-4">{machine.guide.targetMuscles}</div>
        </div>
        <div className="px-2">
          <Gauge size={18} className="mx-auto text-[var(--primary)]" />
          <div className="mt-2 text-[9px] text-[var(--muted)]">Tempo</div>
          <div className="mt-1 text-xs font-bold">{machine.guide.tempo}</div>
        </div>
        <div className="px-2">
          <Wind size={18} className="mx-auto text-[var(--primary)]" />
          <div className="mt-2 text-[9px] text-[var(--muted)]">Atmung</div>
          <div className="mt-1 text-[10px] font-bold leading-4">{machine.guide.breathing}</div>
        </div>
      </section>

      <Button onClick={onStart} className="mt-4 w-full">
        Sätze eintragen
      </Button>
    </div>
  )
}
