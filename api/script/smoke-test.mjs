const baseUrl = process.env.FITPATH_API_URL ?? 'http://127.0.0.1:8787'
const email =
  process.env.FITPATH_SMOKE_EMAIL ?? `mara.${Date.now()}@example.test`

const call = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = await response.json()
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path}: ${response.status} ${body.error}`)
  }
  return { status: response.status, body }
}

const health = await call('/health')
const registration = await call('/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    password: 'FitPath-Test-2026',
    displayName: 'Mara Test',
    inviteCode: 'FIT2026',
  }),
})

const authorization = `Bearer ${registration.body.token}`
const authenticatedHeaders = {
  Authorization: authorization,
  'Content-Type': 'application/json',
}

const onboarding = await call('/v1/onboarding', {
  method: 'POST',
  headers: authenticatedHeaders,
  body: JSON.stringify({
    goal: 'general',
    experience: 'beginner',
    days: 2,
    duration: 45,
    focus: ['balanced'],
    activity: 'walking',
    needsTrainer: false,
  }),
})

const activation = await call('/v1/plans/activate', {
  method: 'POST',
  headers: authenticatedHeaders,
  body: JSON.stringify({ mode: 'starter' }),
})

await call('/v1/workouts', {
  method: 'POST',
  headers: authenticatedHeaders,
  body: JSON.stringify({
    machineId: 'lat-pulldown',
    weight: 20,
    reps: [10, 10, 10],
    completedAt: new Date().toISOString(),
  }),
})
const workouts = await call('/v1/workouts', {
  headers: { Authorization: authorization },
})

console.log(
  JSON.stringify(
    {
      health: health.body.ok,
      registration: registration.status,
      role: registration.body.user.role,
      template: onboarding.body.plan.templateName,
      routeItems: onboarding.body.plan.items.length,
      planStatus: activation.body.plan.status,
      workoutCount: workouts.body.workouts.length,
    },
    null,
    2,
  ),
)
