import { router } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { ActionButton, Card, ScreenTitle } from '@/components/ui'
import { weeklyRoute } from '@/data'
import { useApp } from '@/context/app-context'
import { colors } from '@/theme'

export default function TrainerScreen() {
  const app = useApp()
  const pending = app.planMode === 'trainer_review'

  const publish = () => {
    app.activatePlan('starter')
    router.replace('/(tabs)/home')
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
    >
      <ScreenTitle
        eyebrow="Trainer Workspace"
        title={pending ? '1 Plan wartet.' : 'Keine offenen Pläne.'}
        body="Onboarding prüfen, Maschinen anpassen und den Plan veröffentlichen."
      />

      {pending ? (
        <>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 4 }}>
                <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
                  Mara Klein
                </Text>
                <Text selectable style={{ color: colors.muted }}>
                  Balanced Start · Pilot Studio
                </Text>
              </View>
              <Text selectable style={{ color: colors.warning, fontFamily: 'SpaceGrotesk_700Bold' }}>
                Prüfung
              </Text>
            </View>
            <Text selectable style={{ color: colors.text, lineHeight: 21 }}>
              Ziel: Allgemeine Fitness · 2 Tage · 45 Minuten
            </Text>
            <Text selectable style={{ color: colors.muted, lineHeight: 21 }}>
              Sicherheitsantwort: Trainer-Prüfung angefordert. Keine Diagnose gespeichert.
            </Text>
          </Card>

          <Card>
            <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
              Vorgeschlagene Route
            </Text>
            {weeklyRoute.map((machine) => (
              <View key={machine.id} style={{ flexDirection: 'row', gap: 12 }}>
                <Text selectable style={{ color: colors.primary, fontFamily: 'SpaceGrotesk_700Bold' }}>
                  {machine.number}
                </Text>
                <Text selectable style={{ flex: 1, color: colors.text }}>
                  {machine.name.de}
                </Text>
                <Text selectable style={{ color: colors.muted }}>
                  {machine.sets} × {machine.reps}
                </Text>
              </View>
            ))}
            <ActionButton label="Plan veröffentlichen" onPress={publish} />
          </Card>
        </>
      ) : (
        <Card>
          <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold' }}>
            Alles erledigt
          </Text>
          <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
            Neue Review-Anfragen erscheinen automatisch in dieser Liste.
          </Text>
        </Card>
      )}
    </ScrollView>
  )
}

