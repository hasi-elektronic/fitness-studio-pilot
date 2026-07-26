import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarRange,
  Dumbbell,
  Home,
  QrCode,
  RotateCcw,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import type { FocusArea, MemberView, UserRole } from '../types'

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cx(
          'relative grid shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-[#071319] shadow-[0_10px_30px_rgba(58,186,221,.25)]',
          compact ? 'h-10 w-10' : 'h-12 w-12',
        )}
      >
        <Dumbbell size={compact ? 20 : 24} strokeWidth={2.8} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--bg)] bg-[var(--accent)]" />
      </div>
      <div>
        <div className={cx('font-bold tracking-[-0.04em]', compact ? 'text-lg' : 'text-xl')}>
          Fit<span className="text-[var(--primary)]">Path</span>
        </div>
        {!compact && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Pilot Studio
          </div>
        )}
      </div>
    </div>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
  icon?: LucideIcon
}

export function Button({
  children,
  className,
  variant = 'primary',
  icon: Icon,
  type = 'button',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-[var(--primary)] text-[#06151a] shadow-[0_12px_28px_rgba(58,186,221,.2)] hover:brightness-110',
    accent:
      'bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(255,107,0,.2)] hover:brightness-110',
    secondary:
      'border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] hover:border-[color-mix(in_srgb,var(--primary)_45%,transparent)]',
    ghost: 'bg-transparent text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]',
  }

  return (
    <button
      type={type}
      className={cx(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition duration-200 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-45',
        variants[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={18} strokeWidth={2.3} />}
      {children}
    </button>
  )
}

export function Tag({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'primary' | 'success' | 'warning'
}) {
  const tones = {
    neutral: 'bg-[var(--surface-soft)] text-[var(--muted)]',
    primary: 'bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]',
    success: 'bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]',
    warning: 'bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]',
  }
  return (
    <span className={cx('inline-flex rounded-full px-3 py-1 text-[11px] font-bold', tones[tone])}>
      {children}
    </span>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail?: string
  icon: LucideIcon
}) {
  return (
    <div className="soft-card rounded-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--primary)]">
          <Icon size={16} />
        </span>
      </div>
      <div className="text-2xl font-bold tracking-[-0.05em]">{value}</div>
      {detail && <div className="mt-1 text-[11px] text-[var(--muted)]">{detail}</div>}
    </div>
  )
}

export function MachineArtwork({
  code,
  name,
  photoUrl,
  size = 'large',
}: {
  code: string
  name: string
  photoUrl?: string
  size?: 'small' | 'large'
}) {
  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[linear-gradient(145deg,#1b2e38,#0d151c)]',
        size === 'large' ? 'min-h-60 p-5' : 'h-20 w-20 shrink-0 p-3',
      )}
      aria-label={`${name}, ${code}`}
    >
      {photoUrl && (
        <img
          src={photoUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain opacity-95"
        />
      )}
      {photoUrl && (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,16,.12),transparent_48%,rgba(6,12,16,.92))]" />
      )}
      <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-[var(--primary)] opacity-15 blur-2xl" />
      <div className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-[var(--accent)] opacity-10 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <span className="w-fit rounded-lg bg-white/8 px-2 py-1 text-[10px] font-bold tracking-widest text-white/65">
          {code}
        </span>
        {!photoUrl && (
          <div
            className={cx(
              'grid place-items-center text-[var(--primary)]',
              size === 'large' && 'py-4',
            )}
          >
            <Dumbbell size={size === 'large' ? 58 : 28} strokeWidth={1.4} />
          </div>
        )}
        {size === 'large' && <span className="text-sm font-bold text-white">{name}</span>}
      </div>
    </div>
  )
}

const muscleMapConfig: Record<FocusArea, { image: string; label: string }> = {
  legs: { image: '/muscles/legs.webp', label: 'Beine' },
  chest: { image: '/muscles/chest.webp', label: 'Brust' },
  back: { image: '/muscles/back.webp', label: 'Rücken' },
  shoulders: { image: '/muscles/shoulders.webp', label: 'Schultern' },
  core: { image: '/muscles/core.webp', label: 'Körpermitte' },
  balanced: { image: '/muscles/full-body.webp', label: 'Ganzkörper' },
}

export function MuscleMap({ groups }: { groups: FocusArea[] }) {
  const visibleGroups = groups.filter(
    (group, index) => group !== 'balanced' && groups.indexOf(group) === index,
  )
  const primaryGroup =
    visibleGroups.length > 1 && visibleGroups.includes('back')
      ? 'back'
      : visibleGroups[0] ?? 'balanced'
  const image = muscleMapConfig[primaryGroup].image
  const labels =
    visibleGroups.length > 0
      ? visibleGroups.map((group) => muscleMapConfig[group].label)
      : [muscleMapConfig.balanced.label]

  return (
    <div className="soft-card overflow-hidden rounded-3xl">
      <div className="px-4 pt-4 text-xs font-bold text-[var(--text)]">Trainierte Bereiche</div>
      <img
        src={image}
        alt={`Trainierte Bereiche: ${labels.join(', ')}`}
        loading="lazy"
        className="aspect-square w-full object-cover"
      />
      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
        {labels.map((label) => (
          <span
            key={label}
            className="rounded-full bg-[color-mix(in_srgb,var(--primary)_13%,transparent)] px-2 py-1 text-[9px] font-bold text-[var(--primary)]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BottomNav({
  view,
  onChange,
}: {
  view: MemberView
  onChange: (view: MemberView) => void
}) {
  const items: Array<{ id: MemberView; label: string; icon: LucideIcon }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plan', label: 'Plan', icon: CalendarRange },
    { id: 'scan', label: 'Scan', icon: ScanLine },
    { id: 'progress', label: 'Fortschritt', icon: BarChart3 },
  ]

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[520px] border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] px-3 pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-4">
        {items.map(({ id, label, icon: Icon }) => {
          const active = view === id || (id === 'scan' && view === 'workout')
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cx(
                'relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition',
                active ? 'text-[var(--primary)]' : 'text-[var(--muted)]',
              )}
            >
              {active && (
                <span className="absolute top-0 h-1 w-5 rounded-full bg-[var(--primary)] shadow-[0_0_14px_var(--primary)]" />
              )}
              <Icon size={20} strokeWidth={active ? 2.6 : 1.8} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function DemoToolbar({
  role,
  onRoleChange,
  theme,
  onThemeToggle,
  onReset,
}: {
  role: UserRole
  onRoleChange: (role: UserRole) => void
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onReset: () => void
}) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-white/7 bg-[#070a0e]/92 px-3 text-white backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
        <Sparkles size={14} className="text-[var(--primary)]" />
        Prototyp
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-white/7 p-1">
        {(['member', 'trainer'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onRoleChange(item)}
            className={cx(
              'min-h-8 rounded-lg px-3 text-xs font-bold transition',
              role === item ? 'bg-white text-[#111820]' : 'text-white/55 hover:text-white',
            )}
          >
            {item === 'member' ? 'Mitglied' : 'Trainer'}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onThemeToggle}
          className="grid h-9 w-9 place-items-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white"
          aria-label="Darstellung wechseln"
        >
          <span className="text-sm">{theme === 'dark' ? '☀' : '☾'}</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="grid h-9 w-9 place-items-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white"
          aria-label="Demo zurücksetzen"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}

export function ScanBadge() {
  return (
    <div className="pulse-ring grid h-16 w-16 place-items-center rounded-3xl bg-[var(--primary)] text-[#06151a]">
      <QrCode size={30} strokeWidth={2.6} />
    </div>
  )
}
