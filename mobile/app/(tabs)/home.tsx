import { Link, router } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { ActionButton, Card, ScreenTitle } from '@/components/ui'
import { weeklyRoute } from '@/data'
import { useApp } from '@/context/app-context'
import { colors, radii } from '@/theme'

export default function HomeScreen() {
  const app = useApp()
  const completedIds = new Set(app.logs.map((log) => log.machineId))
  const completed = weeklyRoute.filter((machine) => completedIds.has(machine.id)).length
  const progress = Math.round((completed / weeklyRoute.length) * 100)

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 22 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          selectable
          style={{ color: colors.muted, fontFamily: 'SpaceGrotesk_500Medium' }}
        >
          Pilot Studio · Vaihingen
        </Text>
        <Link href="/trainer" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Trainerbereich öffnen"
            style={{
              minHeight: 42,
              justifyContent: 'center',
              paddingHorizontal: 14,
              borderRadius: radii.pill,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold' }}>
              Trainer
            </Text>
          </Pressable>
        </Link>
      </View>

      <ScreenTitle
        eyebrow="Heute · Tag A"
        title="Guten Morgen, Mara."
        body={
          app.planMode === 'trainer_review'
            ? 'Dein Plan wird gerade vom Trainer geprüft.'
            : 'Balanced Start steht heute auf deinem Plan.'
        }
      />

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 4 }}>
            <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20 }}>
              Ganzkörper Basis
            </Text>
            <Text selectable style={{ color: colors.muted }}>
              45 Min. · {weeklyRoute.length} Stationen
            </Text>
          </View>
          <Text
            selectable
            style={{
              color: colors.primary,
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 22,
              fontVariant: ['tabular-nums'],
            }}
          >
            {progress}%
          </Text>
        </View>
        <View
          style={{
            height: 8,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceRaised,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: colors.primary,
            }}
          />
        </View>
        <ActionButton
          label={completed ? 'Training fortsetzen' : 'Training starten'}
          onPress={() => router.push(`/machine/${weeklyRoute[0].id}`)}
          disabled={app.planMode === 'trainer_review'}
        />
      </Card>

      <View style={{ gap: 12 }}>
        <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20 }}>
          Deine Maschinenroute
        </Text>
        {weeklyRoute.map((machine) => {
          const done = completedIds.has(machine.id)
          return (
            <Link key={machine.id} href={`/machine/${machine.id}`} asChild>
              <Link.Trigger>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${machine.number} ${machine.name[app.language]}, Station ${machine.order}`}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    minHeight: 76,
                    padding: 14,
                    borderRadius: radii.md,
                    borderCurve: 'continuous',
                    borderWidth: 1,
                    borderColor: done ? colors.primaryDark : colors.border,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: radii.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: done ? colors.primary : colors.surfaceRaised,
                    }}
                  >
                    <Text
                      style={{
                        color: done ? colors.background : colors.primary,
                        fontFamily: 'SpaceGrotesk_700Bold',
                      }}
                    >
                      {machine.order.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16 }}>
                      {machine.name[app.language]}
                    </Text>
                    <Text selectable style={{ color: colors.muted, fontSize: 12 }}>
                      {machine.number} · {machine.sets} × {machine.reps}
                    </Text>
                  </View>
                  <Text style={{ color: done ? colors.primary : colors.muted, fontSize: 18 }}>
                    {done ? '✓' : '›'}
                  </Text>
                </Pressable>
              </Link.Trigger>
              <Link.Preview />
            </Link>
          )
        })}
      </View>
    </ScrollView>
  )
}
