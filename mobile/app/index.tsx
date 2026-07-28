import { router } from 'expo-router'
import { useEffect, useState } from 'react'
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
import { t } from '@/i18n'
import { colors, radii } from '@/theme'
import type { Language } from '@/types'

const languageLabels: Record<Language, string> = {
  de: 'DE',
  tr: 'TR',
  en: 'EN',
}

export default function InviteScreen() {
  const app = useApp()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!app.ready) return
    if (app.user?.role === 'trainer' || app.user?.role === 'studio_admin') {
      router.replace('/trainer')
    } else if (app.planMode && app.user) router.replace('/(tabs)/home')
    else if (app.studioCode && app.user) router.replace('/onboarding')
    else if (app.studioCode) router.replace('/auth')
  }, [app.planMode, app.ready, app.studioCode, app.user])

  if (!app.ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  const submit = () => {
    const valid = app.connectStudio(code)
    setError(!valid)
    if (valid) router.push('/auth')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          padding: 24,
          paddingTop: 72,
          paddingBottom: 36,
          gap: 32,
        }}
      >
        <View style={{ gap: 32 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              selectable
              style={{
                color: colors.text,
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 22,
              }}
            >
              Fit<Text style={{ color: colors.primary }}>Path</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(Object.keys(languageLabels) as Language[]).map((language) => (
                <Pressable
                  key={language}
                  onPress={() => app.setLanguage(language)}
                  style={{
                    minWidth: 38,
                    minHeight: 38,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radii.pill,
                    backgroundColor:
                      app.language === language ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color:
                        app.language === language ? colors.background : colors.muted,
                      fontFamily: 'SpaceGrotesk_700Bold',
                    }}
                  >
                    {languageLabels[language]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <ScreenTitle
            eyebrow="Pilot Studio"
            title={t(app.language, 'inviteTitle')}
            body={t(app.language, 'inviteBody')}
          />

          <Card>
            <Text selectable style={labelStyle}>
              {t(app.language, 'studioCode')}
            </Text>
            <TextInput
              accessibilityLabel={t(app.language, 'studioCode')}
              autoCapitalize="characters"
              autoCorrect={false}
              value={code}
              onChangeText={(value) => {
                setCode(value)
                setError(false)
              }}
              placeholder="FIT2026"
              placeholderTextColor={colors.muted}
              style={{
                minHeight: 54,
                borderRadius: radii.md,
                borderCurve: 'continuous',
                borderColor: error ? colors.danger : colors.border,
                borderWidth: 1,
                paddingHorizontal: 16,
                color: colors.text,
                backgroundColor: colors.background,
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 18,
                letterSpacing: 1.2,
              }}
              onSubmitEditing={submit}
            />
            {error ? (
              <Text selectable style={{ color: colors.danger, fontSize: 13 }}>
                Studio-Code nicht gefunden.
              </Text>
            ) : null}
            <ActionButton
              label={t(app.language, 'connect')}
              onPress={submit}
              disabled={!code.trim()}
            />
            <Text selectable style={{ ...labelStyle, textAlign: 'center' }}>
              {t(app.language, 'demoCode')}
            </Text>
          </Card>
        </View>

        <Text
          selectable
          style={{
            color: colors.muted,
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'center',
          }}
        >
          Keine Diagnose · Kein geschätztes Startgewicht · Trainer-geprüfte Vorlagen
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
