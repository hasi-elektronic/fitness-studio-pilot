import { router } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { ActionButton, Card, ScreenTitle } from '@/components/ui'
import { weeklyRoute } from '@/data'
import { useApp } from '@/context/app-context'
import { colors } from '@/theme'

export default function PlanResultScreen() {
  const app = useApp()
  const locked = app.onboarding?.needsTrainer ?? false

  const activate = (mode: 'starter' | 'trainer_review') => {
    app.activatePlan(mode)
    router.replace('/(tabs)/home')
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 24 }}
    >
      <ScreenTitle
        eyebrow="Vorlage freigegeben"
        title="Balanced Start"
        body="Ein klarer Ganzkörper-Einstieg mit kontrollierter Belastung und kurzen Wegen."
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          ['2×', 'pro Woche'],
          ['45', 'Minuten'],
          ['5', 'Stationen'],
        ].map(([value, label]) => (
          <Card key={label} style={{ flex: 1, padding: 14 }}>
            <Text
              selectable
              style={{
                color: colors.text,
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 22,
                fontVariant: ['tabular-nums'],
              }}
            >
              {value}
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 11 }}>
              {label}
            </Text>
          </Card>
        ))}
      </View>

      <Card>
        <Text
          selectable
          style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}
        >
          Gerätefolge
        </Text>
        {weeklyRoute.map((machine) => (
          <View
            key={machine.id}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <Text
              selectable
              style={{
                minWidth: 34,
                color: colors.primary,
                fontFamily: 'SpaceGrotesk_700Bold',
              }}
            >
              {machine.number}
            </Text>
            <Text
              selectable
              style={{
                flex: 1,
                color: colors.text,
                fontFamily: 'SpaceGrotesk_500Medium',
              }}
            >
              {machine.name[app.language]}
            </Text>
            <Text selectable style={{ color: colors.muted }}>
              {machine.sets} × {machine.reps}
            </Text>
          </View>
        ))}
      </Card>

      {locked ? (
        <Card style={{ borderColor: colors.warning }}>
          <Text selectable style={{ color: colors.warning, fontFamily: 'SpaceGrotesk_700Bold' }}>
            Trainer-Prüfung erforderlich
          </Text>
          <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
            Wegen deiner Sicherheitsantwort kann der Starterplan nicht direkt aktiviert werden.
          </Text>
        </Card>
      ) : (
        <Card>
          <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
            Direkt starten
          </Text>
          <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
            Nutze sofort die freigegebene Einstiegsvorlage. Ein Trainer kann sie später anpassen.
          </Text>
          <ActionButton label="Einstieg starten" onPress={() => activate('starter')} />
        </Card>
      )}

      <Card>
        <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
          Trainer prüfen lassen
        </Text>
        <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
          Dein Trainer erhält deine Antworten und veröffentlicht anschließend den persönlichen Plan.
        </Text>
        <ActionButton
          label="Zur Trainer-Prüfung"
          secondary
          onPress={() => activate('trainer_review')}
        />
      </Card>
    </ScrollView>
  )
}

