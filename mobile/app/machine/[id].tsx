import { useVideoPlayer, VideoView } from 'expo-video'
import { Stack, useLocalSearchParams, router } from 'expo-router'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { ActionButton, Card } from '@/components/ui'
import { findMachine } from '@/data'
import { useApp } from '@/context/app-context'
import { colors, radii } from '@/theme'
import type { Athlete } from '@/types'
import { videoAsset } from '@/video-assets'

export default function MachineGuideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const app = useApp()
  const machine = findMachine(id)
  const [athlete, setAthlete] = useState<Athlete>('female')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState(['', '', ''])
  const [section, setSection] = useState<'guide' | 'safety'>('guide')

  const player = useVideoPlayer(
    machine ? videoAsset(machine.id, athlete) : null,
    (instance) => {
      instance.loop = true
      instance.muted = true
      instance.play()
    },
  )

  if (!machine) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
        <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24 }}>
          Gerät nicht gefunden
        </Text>
        <ActionButton label="Zurück" onPress={() => router.back()} />
      </View>
    )
  }

  const canSave =
    Number(weight) > 0 && reps.every((value) => Number(value) > 0)

  const save = () => {
    if (!canSave) return
    app.saveWorkout({
      machineId: machine.id,
      weight: Number(weight),
      reps: reps.map(Number),
      completedAt: new Date().toISOString(),
    })
    router.replace('/(tabs)/progress')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Stack.Screen options={{ title: `${machine.number} · ${machine.name[app.language]}` }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40, gap: 20 }}
      >
        <View style={{ marginHorizontal: 20, gap: 14 }}>
          <VideoView
            player={player}
            nativeControls={false}
            contentFit="cover"
            style={{
              width: '100%',
              aspectRatio: 1,
              borderRadius: radii.lg,
              borderCurve: 'continuous',
              overflow: 'hidden',
              backgroundColor: colors.surface,
            }}
          />
          <View
            accessibilityRole="radiogroup"
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              padding: 4,
              gap: 4,
              borderRadius: radii.pill,
              backgroundColor: colors.surface,
            }}
          >
            {(['female', 'male'] as Athlete[]).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={value === 'female' ? 'Frau' : 'Mann'}
                accessibilityState={{ selected: athlete === value }}
                onPress={() => setAthlete(value)}
                style={{
                  minHeight: 42,
                  minWidth: 90,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radii.pill,
                  backgroundColor:
                    athlete === value ? colors.primary : 'transparent',
                }}
              >
                <Text
                  style={{
                    color:
                      athlete === value ? colors.background : colors.muted,
                    fontFamily: 'SpaceGrotesk_700Bold',
                  }}
                >
                  {value === 'female' ? 'Frau' : 'Mann'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 18 }}>
          <View style={{ gap: 6 }}>
            <Text selectable style={{ color: colors.primary, fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: 1 }}>
              {machine.zone}
            </Text>
            <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 30 }}>
              {machine.name[app.language]}
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 15 }}>
              {machine.muscles[app.language]} · Tempo {machine.tempo}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <ActionButton
                label="Anleitung"
                secondary={section !== 'guide'}
                onPress={() => setSection('guide')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ActionButton
                label="Sicherheit"
                secondary={section !== 'safety'}
                onPress={() => setSection('safety')}
              />
            </View>
          </View>

          {section === 'guide' ? (
            <Card>
              {machine.instructions[app.language].map((instruction, index) => (
                <View
                  key={instruction}
                  style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
                >
                  <Text
                    selectable
                    style={{
                      width: 30,
                      height: 30,
                      textAlign: 'center',
                      lineHeight: 30,
                      borderRadius: radii.pill,
                      backgroundColor: colors.primaryDark,
                      color: colors.primary,
                      fontFamily: 'SpaceGrotesk_700Bold',
                    }}
                  >
                    {index + 1}
                  </Text>
                  <Text
                    selectable
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontFamily: 'SpaceGrotesk_500Medium',
                      lineHeight: 22,
                    }}
                  >
                    {instruction}
                  </Text>
                </View>
              ))}
            </Card>
          ) : (
            <Card style={{ borderColor: colors.warning }}>
              <Text selectable style={{ color: colors.warning, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17 }}>
                Sicher trainieren
              </Text>
              <Text selectable style={{ color: colors.text, lineHeight: 22 }}>
                {machine.safety[app.language]}
              </Text>
              <Text selectable style={{ color: colors.muted, lineHeight: 20, fontSize: 13 }}>
                Bei Schmerzen, Einschränkungen oder Unsicherheit Training stoppen und einen Trainer fragen.
              </Text>
            </Card>
          )}

          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 4 }}>
                <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
                  Heutiges Ziel
                </Text>
                <Text selectable style={{ color: colors.muted }}>
                  Saubere, kontrollierte Wiederholungen
                </Text>
              </View>
              <Text selectable style={{ color: colors.primary, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20 }}>
                {machine.sets} × {machine.reps}
              </Text>
            </View>

            <Text selectable style={{ color: colors.warning, fontSize: 13, lineHeight: 19 }}>
              FitPath schätzt beim ersten Training kein Startgewicht. Beginne leicht oder frage einen Trainer.
            </Text>

            <Text selectable style={{ color: colors.muted, fontFamily: 'SpaceGrotesk_500Medium' }}>
              Gewicht in kg
            </Text>
            <TextInput
              accessibilityLabel="Gewicht in kg"
              inputMode="decimal"
              value={weight}
              onChangeText={setWeight}
              placeholder="z. B. 20"
              placeholderTextColor={colors.muted}
              style={{
                minHeight: 52,
                borderRadius: radii.md,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                paddingHorizontal: 16,
                color: colors.text,
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 18,
              }}
            />

            <Text selectable style={{ color: colors.muted, fontFamily: 'SpaceGrotesk_500Medium' }}>
              Wiederholungen je Satz
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {reps.map((value, index) => (
                <TextInput
                  key={`set-${index + 1}`}
                  accessibilityLabel={`Wiederholungen Satz ${index + 1}`}
                  inputMode="numeric"
                  value={value}
                  onChangeText={(nextValue) =>
                    setReps((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? nextValue : item,
                      ),
                    )
                  }
                  placeholder={`S${index + 1}`}
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    minHeight: 52,
                    borderRadius: radii.md,
                    borderCurve: 'continuous',
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    textAlign: 'center',
                    color: colors.text,
                    fontFamily: 'SpaceGrotesk_700Bold',
                    fontSize: 18,
                  }}
                />
              ))}
            </View>
            <ActionButton label="Sätze speichern" disabled={!canSave} onPress={save} />
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
