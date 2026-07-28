import { router, Stack } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { ActionButton, Card, ScreenTitle, labelStyle } from '@/components/ui'
import { useApp } from '@/context/app-context'
import { colors, radii } from '@/theme'

export default function AuthScreen() {
  const app = useApp()
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError('')
    setLoading(true)
    const result = await app.authenticate({
      mode,
      displayName,
      email,
      password,
    })
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const trainerLogin =
      result.user.role === 'trainer' || result.user.role === 'studio_admin'
    router.replace(trainerLogin ? '/trainer' : '/onboarding')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Stack.Screen options={{ title: 'Konto' }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 22 }}
      >
        <ScreenTitle
          eyebrow="Pilot Studio"
          title={mode === 'register' ? 'Dein FitPath-Konto' : 'Willkommen zurück'}
          body={
            mode === 'register'
              ? 'Dein Plan, deine Geräte und dein Fortschritt bleiben deinem Konto zugeordnet.'
              : 'Melde dich mit deinem Studio-Konto an.'
          }
        />

        <View
          accessibilityRole="tablist"
          style={{
            flexDirection: 'row',
            gap: 4,
            padding: 4,
            borderRadius: radii.pill,
            backgroundColor: colors.surface,
          }}
        >
          {[
            ['register', 'Konto erstellen'],
            ['login', 'Anmelden'],
          ].map(([value, label]) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === value }}
              onPress={() => {
                setMode(value as 'register' | 'login')
                setError('')
              }}
              style={{
                flex: 1,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radii.pill,
                backgroundColor: mode === value ? colors.primary : 'transparent',
              }}
            >
              <Text
                style={{
                  color: mode === value ? colors.background : colors.muted,
                  fontFamily: 'SpaceGrotesk_700Bold',
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Card>
          {mode === 'register' ? (
            <>
              <Text selectable style={labelStyle}>
                Name
              </Text>
              <TextInput
                accessibilityLabel="Name"
                autoComplete="name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Mara Klein"
                placeholderTextColor={colors.muted}
                style={inputStyle}
              />
            </>
          ) : null}

          <Text selectable style={labelStyle}>
            E-Mail
          </Text>
          <TextInput
            accessibilityLabel="E-Mail"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            inputMode="email"
            value={email}
            onChangeText={setEmail}
            placeholder="mara@beispiel.de"
            placeholderTextColor={colors.muted}
            style={inputStyle}
          />

          <Text selectable style={labelStyle}>
            Passwort
          </Text>
          <TextInput
            accessibilityLabel="Passwort"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Mindestens 10 Zeichen"
            placeholderTextColor={colors.muted}
            style={inputStyle}
            onSubmitEditing={() => void submit()}
          />

          {error ? (
            <Text selectable style={{ color: colors.danger, lineHeight: 20 }}>
              {error}
            </Text>
          ) : null}

          <ActionButton
            label={mode === 'register' ? 'Konto erstellen' : 'Anmelden'}
            disabled={loading || !email.trim() || !password}
            onPress={() => void submit()}
          />
          {__DEV__ && mode === 'register' ? (
            <ActionButton
              label="Testdaten einsetzen"
              secondary
              onPress={() => {
                setDisplayName('Mara Mobile')
                setEmail(`mara.${Date.now()}@example.test`)
                setPassword('FitPath-Test-2026')
                setError('')
              }}
            />
          ) : null}
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
        </Card>

        <Card style={{ borderColor: app.liveApiEnabled ? colors.primaryDark : colors.border }}>
          <Text
            selectable
            style={{
              color: app.liveApiEnabled ? colors.primary : colors.warning,
              fontFamily: 'SpaceGrotesk_700Bold',
            }}
          >
            {app.liveApiEnabled ? 'Cloud-Synchronisierung aktiv' : 'Lokaler Testmodus'}
          </Text>
          <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
            {app.liveApiEnabled
              ? 'Dein Konto wird sicher mit dem FitPath-Server verbunden.'
              : 'Noch kein Live-Server verbunden. Das Passwort wird im Testmodus nicht gespeichert.'}
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const inputStyle = {
  minHeight: 54,
  borderRadius: radii.md,
  borderCurve: 'continuous' as const,
  borderColor: colors.border,
  borderWidth: 1,
  paddingHorizontal: 16,
  color: colors.text,
  backgroundColor: colors.background,
  fontFamily: 'SpaceGrotesk_500Medium',
  fontSize: 16,
}
