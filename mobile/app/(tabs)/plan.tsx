import { Link } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Card, ScreenTitle } from '@/components/ui'
import { weeklyRoute } from '@/data'
import { useApp } from '@/context/app-context'
import { colors, radii } from '@/theme'

export default function PlanScreen() {
  const app = useApp()

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 22 }}
    >
      <ScreenTitle
        eyebrow="Balanced Start"
        title="Deine Trainingswoche"
        body="Zwei Ganzkörpertage mit trainer-geprüfter Maschinenfolge."
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1 }}>
          <Text selectable style={{ color: colors.primary, fontFamily: 'SpaceGrotesk_700Bold' }}>
            TAG A
          </Text>
          <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
            Montag
          </Text>
          <Text selectable style={{ color: colors.muted }}>Ganzkörper Basis</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text selectable style={{ color: colors.primary, fontFamily: 'SpaceGrotesk_700Bold' }}>
            TAG B
          </Text>
          <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
            Donnerstag
          </Text>
          <Text selectable style={{ color: colors.muted }}>Variation</Text>
        </Card>
      </View>

      <Card>
        {weeklyRoute.map((machine, index) => (
          <Link key={machine.id} href={`/machine/${machine.id}`} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${machine.number} ${machine.name[app.language]}, ${machine.sets} mal ${machine.reps}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                minHeight: 58,
                gap: 12,
                opacity: pressed ? 0.7 : 1,
                borderBottomWidth: index < weeklyRoute.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              })}
            >
              <Text
                selectable
                style={{
                  width: 34,
                  height: 34,
                  textAlign: 'center',
                  lineHeight: 34,
                  borderRadius: radii.pill,
                  backgroundColor: colors.primaryDark,
                  color: colors.primary,
                  fontFamily: 'SpaceGrotesk_700Bold',
                }}
              >
                {machine.order}
              </Text>
              <View style={{ flex: 1 }}>
                <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold' }}>
                  {machine.name[app.language]}
                </Text>
                <Text selectable style={{ color: colors.muted, fontSize: 12 }}>
                  {machine.number} · {machine.zone}
                </Text>
              </View>
              <Text selectable style={{ color: colors.muted }}>
                {machine.sets} × {machine.reps}
              </Text>
            </Pressable>
          </Link>
        ))}
      </Card>
    </ScrollView>
  )
}
