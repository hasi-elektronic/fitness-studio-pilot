import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { ActionButton, Choice, ScreenTitle } from '@/components/ui'
import { useApp } from '@/context/app-context'
import { colors, radii } from '@/theme'
import type { OnboardingAnswers } from '@/types'

type Draft = Partial<OnboardingAnswers>
type Option = { label: string; value: string | number | boolean; body?: string }

export default function OnboardingScreen() {
  const app = useApp()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({ focus: [] })

  const steps = useMemo(
    () => [
      {
        key: 'goal',
        eyebrow: 'Dein Ziel',
        title: 'Was ist dein Hauptziel?',
        options: [
          { label: 'Allgemein fitter', value: 'general', body: 'Ausgewogen und regelmäßig trainieren' },
          { label: 'Muskeln aufbauen', value: 'muscle', body: 'Kraft und Trainingsvolumen steigern' },
          { label: 'Gewicht kontrollieren', value: 'weight', body: 'Aktiver werden und Routine aufbauen' },
          { label: 'Ausdauer verbessern', value: 'endurance', body: 'Länger leistungsfähig bleiben' },
        ],
      },
      {
        key: 'experience',
        eyebrow: 'Dein Level',
        title: 'Wie viel Erfahrung hast du?',
        options: [
          { label: 'Einsteiger', value: 'beginner', body: 'Weniger als 6 Monate' },
          { label: 'Fortgeschritten', value: 'intermediate', body: 'Regelmäßig seit 6–24 Monaten' },
          { label: 'Erfahren', value: 'advanced', body: 'Mehr als 2 Jahre' },
        ],
      },
      {
        key: 'days',
        eyebrow: 'Deine Woche',
        title: 'Wie oft möchtest du trainieren?',
        options: [2, 3, 4, 5].map((value) => ({
          label: `${value} Tage pro Woche`,
          value,
          body: value < 4 ? 'Gut planbar und nachhaltig' : 'Mehr Trainingsvolumen',
        })),
      },
      {
        key: 'duration',
        eyebrow: 'Deine Zeit',
        title: 'Wie lange dauert eine Einheit?',
        options: [30, 45, 60, 90].map((value) => ({
          label: `${value} Minuten`,
          value,
          body: value <= 45 ? 'Fokussierte Einheit' : 'Ausführliche Einheit',
        })),
      },
      {
        key: 'focus',
        eyebrow: 'Dein Fokus',
        title: 'Was möchtest du besonders trainieren?',
        options: [
          { label: 'Ausgewogen', value: 'balanced' },
          { label: 'Beine & Po', value: 'legs' },
          { label: 'Rücken', value: 'back' },
          { label: 'Brust', value: 'chest' },
          { label: 'Körpermitte', value: 'core' },
        ],
      },
      {
        key: 'activity',
        eyebrow: 'Deine Aktivität',
        title: 'Bist du außerhalb des Studios aktiv?',
        options: [
          { label: 'Aktuell keine', value: 'none' },
          { label: 'Spazieren / Wandern', value: 'walking' },
          { label: 'Laufen', value: 'running' },
          { label: 'Radfahren', value: 'cycling' },
          { label: 'Andere Sportart', value: 'other' },
        ],
      },
      {
        key: 'needsTrainer',
        eyebrow: 'Sicher starten',
        title: 'Gibt es eine Einschränkung oder bist du unsicher?',
        body: 'Wir fragen keine Diagnose ab. Bei Unsicherheit prüft ein Trainer deinen Plan.',
        options: [
          { label: 'Nein, ich kann regulär starten', value: false },
          { label: 'Ja oder ich bin unsicher', value: true, body: 'Trainer-Prüfung vor dem Start' },
        ],
      },
    ],
    [],
  )

  const current = steps[step]
  const currentValue = draft[current.key as keyof Draft]
  const hasValue = current.key === 'focus'
    ? (draft.focus?.length ?? 0) > 0
    : currentValue !== undefined

  const choose = (option: Option) => {
    if (current.key === 'focus') {
      setDraft((value) => ({ ...value, focus: [String(option.value)] }))
      return
    }
    setDraft((value) => ({ ...value, [current.key]: option.value }))
  }

  const next = () => {
    if (step < steps.length - 1) {
      setStep((value) => value + 1)
      return
    }
    app.saveOnboarding(draft as OnboardingAnswers)
    router.replace('/plan-result')
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 24 }}
    >
      <View style={{ gap: 10 }}>
        <View
          accessibilityRole="progressbar"
          style={{
            height: 6,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceRaised,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
              height: '100%',
              backgroundColor: colors.primary,
            }}
          />
        </View>
        <Text
          selectable
          style={{
            color: colors.muted,
            fontFamily: 'SpaceGrotesk_500Medium',
            fontVariant: ['tabular-nums'],
          }}
        >
          {step + 1} / {steps.length}
        </Text>
      </View>

      <ScreenTitle
        eyebrow={current.eyebrow}
        title={current.title}
        body={current.body}
      />

      <View style={{ gap: 10 }}>
        {current.options.map((option) => {
          const selected =
            current.key === 'focus'
              ? draft.focus?.includes(String(option.value)) ?? false
              : currentValue === option.value
          return (
            <Choice
              key={String(option.value)}
              title={option.label}
              body={'body' in option ? option.body : undefined}
              selected={selected}
              onPress={() => choose(option)}
            />
          )
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <ActionButton
            label="Zurück"
            secondary
            disabled={step === 0}
            onPress={() => setStep((value) => Math.max(0, value - 1))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ActionButton
            label={step === steps.length - 1 ? 'Plan erstellen' : 'Weiter'}
            disabled={!hasValue}
            onPress={next}
          />
        </View>
      </View>
    </ScrollView>
  )
}
