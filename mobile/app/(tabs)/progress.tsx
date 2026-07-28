import { ScrollView, Text, View } from 'react-native'
import { Card, ScreenTitle } from '@/components/ui'
import { findMachine } from '@/data'
import { useApp } from '@/context/app-context'
import { colors } from '@/theme'

export default function ProgressScreen() {
  const app = useApp()
  const totalSets = app.logs.reduce((sum, log) => sum + log.reps.length, 0)
  const totalReps = app.logs.reduce(
    (sum, log) => sum + log.reps.reduce((setSum, reps) => setSum + reps, 0),
    0,
  )

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 22 }}
    >
      <ScreenTitle
        eyebrow="Dein Fortschritt"
        title="Konstanz schlägt Perfektion."
        body="Deine Einträge bleiben auf diesem Gerät gespeichert, bis der Live-Account aktiviert wird."
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          [app.logs.length, 'Geräte'],
          [totalSets, 'Sätze'],
          [totalReps, 'Wdh.'],
        ].map(([value, label]) => (
          <Card key={label} style={{ flex: 1, padding: 14 }}>
            <Text
              selectable
              style={{
                color: colors.primary,
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 24,
                fontVariant: ['tabular-nums'],
              }}
            >
              {value}
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 12 }}>
              {label}
            </Text>
          </Card>
        ))}
      </View>

      {app.logs.length ? (
        <View style={{ gap: 10 }}>
          {app.logs.map((log) => {
            const machine = findMachine(log.machineId)
            return (
              <Card key={`${log.machineId}-${log.completedAt}`}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ gap: 4 }}>
                    <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold' }}>
                      {machine?.name[app.language] ?? log.machineId}
                    </Text>
                    <Text selectable style={{ color: colors.muted, fontSize: 12 }}>
                      {new Date(log.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text selectable style={{ color: colors.primary, fontFamily: 'SpaceGrotesk_700Bold' }}>
                    {log.weight} kg
                  </Text>
                </View>
                <Text selectable style={{ color: colors.muted }}>
                  {log.reps.join(' · ')} Wiederholungen
                </Text>
              </Card>
            )
          })}
        </View>
      ) : (
        <Card>
          <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold' }}>
            Noch kein Training gespeichert
          </Text>
          <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
            Öffne eine Maschine und trage dein erstes leichtes Testgewicht ein.
          </Text>
        </Card>
      )}
    </ScrollView>
  )
}

