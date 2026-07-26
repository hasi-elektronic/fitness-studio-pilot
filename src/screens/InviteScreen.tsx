import { useState } from 'react'
import { ArrowRight, BadgeCheck, Dumbbell, Link2, ShieldCheck } from 'lucide-react'
import { BrandMark, Button } from '../components/ui'
import { studioTheme } from '../data'
import { validateInviteCode } from '../engine'

function MachineStage() {
  return (
    <div
      className="relative h-48 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[radial-gradient(circle_at_50%_35%,rgba(58,186,221,.15),transparent_54%),#0b1318] sm:h-56 lg:h-[32rem]"
      aria-label="Beinpresse und Brustpresse aus dem Studio"
    >
      <img
        src="/machines/leg-press.jpg"
        alt=""
        className="absolute bottom-0 left-0 h-[94%] w-[58%] object-contain object-bottom mix-blend-lighten lg:h-[88%] lg:w-[62%]"
      />
      <img
        src="/machines/chest-press.jpg"
        alt=""
        className="absolute bottom-0 right-0 h-[88%] w-[54%] object-contain object-bottom mix-blend-lighten lg:h-[82%] lg:w-[57%]"
      />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0b1318] to-transparent" />
    </div>
  )
}

const trustItems = [
  { icon: BadgeCheck, label: 'Trainer-geprüft' },
  { icon: Dumbbell, label: 'Nur Studio-Geräte' },
  { icon: ShieldCheck, label: 'Kein geschätztes Startgewicht' },
]

function TrustBand() {
  return (
    <div className="mt-4 grid grid-cols-3 divide-x divide-[var(--border)] rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-2 py-4">
      {trustItems.map(({ icon: Icon, label }) => (
        <div key={label} className="flex min-w-0 flex-col items-center px-2 text-center">
          <Icon size={20} className="mb-2 text-[var(--primary)]" strokeWidth={1.8} />
          <span className="text-[10px] font-bold leading-4 text-[var(--text)] sm:text-xs">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

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
    <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-4 pb-8 pt-18 sm:px-6 lg:pt-24">
      <div className="lg:grid lg:grid-cols-[.88fr_1.12fr] lg:items-center lg:gap-14">
        <section className="enter mx-auto w-full max-w-md lg:mx-0">
          <BrandMark />

          <h1 className="mt-7 text-[2.7rem] font-bold leading-[.94] tracking-[-0.065em] sm:text-5xl lg:mt-10 lg:text-6xl">
            Dein Plan.
            <br />
            Deine Geräte.
            <br />
            <span className="text-[var(--primary)]">Dein Fortschritt.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
            Trainer-geprüfte Trainingspläne für die Geräte in deinem Studio.
          </p>

          <div className="mt-6 lg:hidden">
            <MachineStage />
          </div>

          <div className="glass mt-5 rounded-[2rem] p-5 sm:mt-7 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--primary)]">
                <Link2 size={19} />
              </span>
              <div>
                <div className="text-base font-bold">Mit Studio verbinden</div>
                <div className="mt-0.5 text-[11px] text-[var(--muted)]">
                  {studioTheme.location}
                </div>
              </div>
            </div>

            <label htmlFor="studio-code" className="sr-only">
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
              className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 text-center text-base font-bold tracking-[0.2em] text-[var(--text)] placeholder:tracking-normal placeholder:text-[var(--muted)]"
            />
            {error && (
              <p className="mt-2 text-sm font-semibold text-[#ff7b72]" role="alert">
                {error}
              </p>
            )}

            <Button onClick={submit} className="mt-4 w-full" icon={ArrowRight}>
              Studio-Code eingeben
            </Button>

            <div className="mt-3 text-center text-[10px] text-[var(--muted)]">
              Demo-Code: <strong className="text-[var(--text)]">FIT2026</strong>
            </div>
          </div>

          <div className="lg:hidden">
            <TrustBand />
          </div>
        </section>

        <section className="hidden lg:block">
          <MachineStage />
          <TrustBand />
        </section>
      </div>

      <p className="mx-auto mt-5 max-w-xl text-center text-[10px] leading-5 text-[var(--muted)] lg:mt-8">
        Der Code ordnet dich nur diesem Studio zu. Im Prototyp werden keine echten persönlichen
        Daten verarbeitet.
      </p>
    </main>
  )
}
