import { useState } from 'react'
import { ArrowRight, BadgeCheck, LockKeyhole, QrCode, ShieldCheck } from 'lucide-react'
import { BrandMark, Button, Tag } from '../components/ui'
import { studioTheme } from '../data'
import { validateInviteCode } from '../engine'

export function InviteScreen({ onContinue }: { onContinue: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    if (!validateInviteCode(code, studioTheme.inviteCode)) {
      setError('Dieser Studio-Code ist nicht gültig.')
      return
    }
    onContinue()
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-4 pb-8 pt-22 sm:px-6 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16">
      <section className="hidden lg:block">
        <Tag tone="primary">Training, das mitdenkt</Tag>
        <h1 className="mt-7 max-w-2xl text-6xl font-bold leading-[.96] tracking-[-0.065em]">
          Dein Weg durchs Studio.{' '}
          <span className="text-[var(--primary)]">Einfach klar.</span>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
          FitPath verbindet deinen Trainingsplan mit den Geräten im Studio und zeigt dir bei jedem
          Besuch genau den nächsten sinnvollen Schritt.
        </p>
        <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
          {[
            { icon: BadgeCheck, title: 'Freigegeben', detail: 'durch Trainer' },
            { icon: QrCode, title: 'Direkt am Gerät', detail: 'per QR-Code' },
            { icon: ShieldCheck, title: 'Transparent', detail: 'ohne Gesundheitsdiagnose' },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="soft-card rounded-3xl p-4">
              <Icon size={21} className="mb-6 text-[var(--primary)]" />
              <div className="text-sm font-bold">{title}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">{detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="enter mx-auto w-full max-w-md">
        <div className="mb-10 lg:hidden">
          <BrandMark />
          <h1 className="mt-10 text-4xl font-bold leading-[1.02] tracking-[-0.055em]">
            Dein Training.
            <br />
            <span className="text-[var(--primary)]">Dein klarer Weg.</span>
          </h1>
          <p className="mt-4 leading-7 text-[var(--muted)]">
            Persönlicher Maschinenplan, direkt in deinem Studio.
          </p>
        </div>

        <div className="glass rounded-[2rem] p-5 sm:p-7">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">Mit Studio verbinden</div>
              <div className="mt-1 text-xs text-[var(--muted)]">{studioTheme.location}</div>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
              <LockKeyhole size={20} />
            </span>
          </div>

          <label htmlFor="studio-code" className="mb-2 block text-xs font-bold text-[var(--muted)]">
            Dein Studio-Code
          </label>
          <input
            id="studio-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase())
              setError('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
            placeholder="z. B. FIT2026"
            autoCapitalize="characters"
            className="h-15 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 text-center text-lg font-bold tracking-[0.2em] text-[var(--text)] placeholder:tracking-normal placeholder:text-[var(--muted)]"
          />
          {error && <p className="mt-2 text-sm font-semibold text-[#ff7b72]">{error}</p>}

          <Button onClick={submit} className="mt-5 w-full" icon={ArrowRight}>
            Weiter
          </Button>

          <div className="mt-5 rounded-2xl bg-[var(--surface-raised)] px-4 py-3 text-center text-xs text-[var(--muted)]">
            Demo-Code: <strong className="text-[var(--text)]">FIT2026</strong>
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-sm text-center text-[11px] leading-5 text-[var(--muted)]">
          Der Code ordnet dich nur diesem Studio zu. In diesem Prototyp werden keine echten
          persönlichen Daten verarbeitet.
        </p>
      </section>
    </main>
  )
}
