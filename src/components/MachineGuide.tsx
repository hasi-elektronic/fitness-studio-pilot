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

type MovementDiagramConfig = {
  equipment: string
  body: string
  start: string
  end: string
  arrow: string
}

const movementDiagrams: Record<Machine['guide']['motion'], MovementDiagramConfig> = {
  'diagonal-press': {
    equipment: 'M28 88 L68 88 M34 84 L55 52 M113 25 L145 58',
    body: 'M48 33 A7 7 0 1 1 47.9 33 M52 42 L67 60',
    start: 'M67 60 L94 67 L116 49',
    end: 'M67 60 L105 48 L137 34',
    arrow: 'M105 62 Q125 55 138 39',
  },
  'vertical-press': {
    equipment: 'M45 88 L45 30 M40 88 L82 88 M43 55 L70 55',
    body: 'M61 37 A7 7 0 1 1 60.9 37 M61 44 L61 70 L49 88 M61 70 L74 88',
    start: 'M61 50 L48 61 L39 47 M61 50 L74 61 L84 47',
    end: 'M61 50 L48 30 L47 12 M61 50 L74 30 L75 12',
    arrow: 'M91 57 L91 21',
  },
  'horizontal-press': {
    equipment: 'M39 88 L39 28 M37 65 L72 65 M132 25 L132 78',
    body: 'M57 38 A7 7 0 1 1 56.9 38 M57 45 L57 70 L45 88 M57 70 L70 88',
    start: 'M57 50 L77 50 L91 38 M57 50 L77 55 L91 68',
    end: 'M57 50 L96 48 L125 40 M57 50 L96 55 L125 64',
    arrow: 'M93 24 L128 24',
  },
  'horizontal-pull': {
    equipment: 'M38 88 L38 31 M36 65 L70 65 M138 50 L151 50',
    body: 'M58 38 A7 7 0 1 1 57.9 38 M58 45 L58 70 L46 88 M58 70 L71 88',
    start: 'M58 50 L98 49 L132 50 M58 54 L98 55 L132 50',
    end: 'M58 50 L76 45 L91 51 M58 54 L76 60 L91 51',
    arrow: 'M129 27 L92 27',
  },
  'vertical-pull': {
    equipment: 'M30 18 L145 18 M36 18 L36 88 M139 18 L139 88',
    body: 'M87 42 A7 7 0 1 1 86.9 42 M87 49 L87 72 L74 90 M87 72 L100 90',
    start: 'M87 53 L63 33 L55 18 M87 53 L111 33 L119 18',
    end: 'M87 53 L67 58 L54 42 M87 53 L107 58 L120 42',
    arrow: 'M145 29 L145 63',
  },
  'arc-close': {
    equipment: 'M86 38 L86 88 M60 88 L112 88',
    body: 'M86 26 A7 7 0 1 1 85.9 26 M86 34 L86 72',
    start: 'M86 43 Q58 42 34 62 M86 43 Q114 42 138 62',
    end: 'M86 43 Q76 48 80 70 M86 43 Q96 48 92 70',
    arrow: 'M43 28 Q86 8 129 28',
  },
  curl: {
    equipment: 'M30 58 L130 58 M42 58 L34 88 M119 58 L128 88',
    body: 'M48 40 A7 7 0 1 1 47.9 40 M55 46 L86 53',
    start: 'M86 53 L119 58 L145 72',
    end: 'M86 53 L112 66 L98 88',
    arrow: 'M143 48 Q126 72 104 82',
  },
  crunch: {
    equipment: 'M38 88 L38 38 M35 65 L70 65',
    body: 'M59 31 A7 7 0 1 1 58.9 31 M59 39 L59 70 L47 88 M59 70 L74 88',
    start: 'M59 42 L62 42',
    end: 'M59 42 Q78 52 82 69',
    arrow: 'M91 25 Q105 49 91 70',
  },
  extension: {
    equipment: 'M58 72 L112 72 M66 72 L54 91 M104 72 L116 91',
    body: 'M85 62 L85 84 L72 94 M85 84 L99 94',
    start: 'M85 62 L63 48 L42 51 M42 51 A7 7 0 1 1 41.9 51',
    end: 'M85 62 L85 34 L85 18 M85 18 A7 7 0 1 1 84.9 18',
    arrow: 'M105 57 Q115 35 99 18',
  },
}

function MovementDiagram({
  machine,
  playing,
}: {
  machine: Machine
  playing: boolean
}) {
  const diagram = movementDiagrams[machine.guide.motion]

  return (
    <div
      className={cx(
        'movement-diagram absolute right-3 top-3 w-[46%] max-w-52 rounded-2xl border border-white/10 bg-[#05090c]/88 p-2 backdrop-blur-sm',
        !playing && 'movement-diagram--paused',
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 170 106" className="h-auto w-full" fill="none">
        <defs>
          <marker
            id={`arrow-${machine.id}`}
            markerWidth="7"
            markerHeight="7"
            refX="5.5"
            refY="3.5"
            orient="auto"
          >
            <path d="M0 0 L7 3.5 L0 7 Z" fill="currentColor" />
          </marker>
        </defs>
        <path
          d={diagram.equipment}
          stroke="rgba(255,255,255,.22)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={diagram.body}
          stroke="rgba(255,255,255,.72)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={diagram.start}
          className="movement-pose movement-pose--start"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={diagram.end}
          className="movement-pose movement-pose--end"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={diagram.arrow}
          className="movement-arrow"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="5 5"
          markerEnd={`url(#arrow-${machine.id})`}
        />
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[8px] font-bold uppercase tracking-wider text-white/45">
        <span>Start</span>
        <span>Ende</span>
      </div>
    </div>
  )
}

function MotionDemo({ machine }: { machine: Machine }) {
  const [playing, setPlaying] = useState(true)

  return (
    <section
      className="machine-demo relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[#080d11]"
      aria-label={`Bewegungsanimation für ${machine.name}`}
    >
      <div className="relative aspect-[1.2/1] min-h-72">
        <img
          src={machine.photoUrl}
          alt={`${machine.name} in der Ausgangsposition`}
          className="absolute inset-0 h-full w-full object-contain p-3 opacity-92"
        />
        <MovementDiagram machine={machine} playing={playing} />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(5,10,14,.96))]" />
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
