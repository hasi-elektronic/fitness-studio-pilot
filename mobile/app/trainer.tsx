import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { getTrainerReviews, publishTrainerReview } from '@/api'
import { ActionButton, Card, ScreenTitle } from '@/components/ui'
import { weeklyRoute } from '@/data'
import { useApp } from '@/context/app-context'
import { colors } from '@/theme'
import type { TrainerReview } from '@/types'

const demoReview: TrainerReview = {
  id: 'demo-review',
  planId: 'demo-plan',
  safetyFlag: 1,
  createdAt: new Date().toISOString(),
  userId: 'demo-member',
  displayName: 'Mara Klein',
  email: 'mara@fitpath.demo',
  templateName: 'Balanced Start',
}

export default function TrainerScreen() {
  const app = useApp()
  const allowed = app.user?.role === 'trainer' || app.user?.role === 'studio_admin'
  const [reviews, setReviews] = useState<TrainerReview[]>(
    app.liveApiEnabled ? [] : [demoReview],
  )
  const [loading, setLoading] = useState(app.liveApiEnabled)
  const [error, setError] = useState('')
  const [publishingId, setPublishingId] = useState<string | null>(null)

  useEffect(() => {
    if (!allowed || !app.liveApiEnabled || !app.sessionToken) {
      setLoading(false)
      return
    }
    getTrainerReviews(app.sessionToken)
      .then((result) => setReviews(result.reviews))
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : 'Liste konnte nicht geladen werden.'),
      )
      .finally(() => setLoading(false))
  }, [allowed, app.liveApiEnabled, app.sessionToken])

  const publish = async (review: TrainerReview) => {
    setPublishingId(review.id)
    setError('')
    try {
      if (app.liveApiEnabled && app.sessionToken) {
        await publishTrainerReview(app.sessionToken, review.id)
      }
      setReviews((current) => current.filter((item) => item.id !== review.id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Veröffentlichung fehlgeschlagen.')
    } finally {
      setPublishingId(null)
    }
  }

  if (!allowed) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 24, gap: 20 }}
      >
        <ScreenTitle
          eyebrow="Geschützter Bereich"
          title="Trainer-Zugang erforderlich"
          body="Dieser Bereich ist nur für freigeschaltete Trainer und Studio-Administratoren sichtbar."
        />
        <ActionButton label="Zurück" onPress={() => router.back()} />
      </ScrollView>
    )
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
    >
      <ScreenTitle
        eyebrow="Trainer Workspace"
        title={
          loading
            ? 'Pläne werden geladen …'
            : reviews.length === 1
              ? '1 Plan wartet.'
              : `${reviews.length} Pläne warten.`
        }
        body="Onboarding prüfen, Maschinen anpassen und den Plan veröffentlichen."
      />

      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? (
        <Text selectable style={{ color: colors.danger, lineHeight: 20 }}>
          {error}
        </Text>
      ) : null}

      {!loading && reviews.length === 0 ? (
        <Card>
          <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold' }}>
            Alles erledigt
          </Text>
          <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
            Neue Review-Anfragen erscheinen automatisch in dieser Liste.
          </Text>
        </Card>
      ) : null}

      {reviews.map((review) => (
        <View key={review.id} style={{ gap: 14 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text selectable style={{ color: colors.text, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 }}>
                  {review.displayName}
                </Text>
                <Text selectable style={{ color: colors.muted }}>
                  {review.templateName} · Pilot Studio
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
            <ActionButton
              label={publishingId === review.id ? 'Wird veröffentlicht …' : 'Plan veröffentlichen'}
              disabled={publishingId !== null}
              onPress={() => void publish(review)}
            />
          </Card>
        </View>
      ))}

      <ActionButton
        label="Abmelden"
        secondary
        onPress={() => void app.logout().then(() => router.replace('/'))}
      />
    </ScrollView>
  )
}
