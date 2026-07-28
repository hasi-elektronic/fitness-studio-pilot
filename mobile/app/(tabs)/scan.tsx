import { CameraView, useCameraPermissions } from 'expo-camera'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { ActionButton, Card, ScreenTitle } from '@/components/ui'
import { resolveQrMachine, weeklyRoute } from '@/data'
import { useApp } from '@/context/app-context'
import { colors, radii } from '@/theme'

export default function ScanScreen() {
  const app = useApp()
  const [permission, requestPermission] = useCameraPermissions()
  const [active, setActive] = useState(false)
  const [scanned, setScanned] = useState(false)

  useFocusEffect(
    useCallback(() => {
      setActive(true)
      setScanned(false)
      return () => setActive(false)
    }, []),
  )

  const openMachine = (data: string) => {
    if (scanned) return
    const machine = resolveQrMachine(data)
    if (!machine) return
    setScanned(true)
    router.push(`/machine/${machine.id}`)
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
    >
      <ScreenTitle
        eyebrow="QR Scanner"
        title="Gerät scannen"
        body="Richte die Kamera auf den QR-Code der Maschine."
      />

      {!permission?.granted ? (
        <Card>
          <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
            Kamera erlauben
          </Text>
          <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
            FitPath verwendet die Kamera ausschließlich zum Lesen von Geräte-QR-Codes.
          </Text>
          <ActionButton label="Kamera freigeben" onPress={() => void requestPermission()} />
        </Card>
      ) : (
        <View
          style={{
            height: 360,
            overflow: 'hidden',
            borderRadius: radii.lg,
            borderCurve: 'continuous',
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          {active ? (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : ({ data }) => openMachine(data)}
            />
          ) : null}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 52,
              right: 52,
              top: 78,
              bottom: 78,
              borderRadius: radii.md,
              borderColor: colors.primary,
              borderWidth: 3,
            }}
          />
        </View>
      )}

      <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
        Oder Gerät auswählen
      </Text>
      <View style={{ gap: 8 }}>
        {weeklyRoute.map((machine) => (
          <Pressable
            key={machine.id}
            accessibilityRole="button"
            accessibilityLabel={`${machine.number} ${machine.name[app.language]} öffnen`}
            onPress={() => router.push(`/machine/${machine.id}`)}
            style={({ pressed }) => ({
              minHeight: 54,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 16,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text selectable style={{ color: colors.primary, fontFamily: 'SpaceGrotesk_700Bold' }}>
              {machine.number}
            </Text>
            <Text selectable style={{ flex: 1, color: colors.text, fontFamily: 'SpaceGrotesk_500Medium' }}>
              {machine.name[app.language]}
            </Text>
            <Text style={{ color: colors.muted }}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
