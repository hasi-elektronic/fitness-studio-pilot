import { hashPassword, randomToken, sha256, verifyPassword } from './crypto'
import type { Env, SessionUser, UserRole } from './types'
import {
  HttpError,
  normalizeEmail,
  readJson,
  validateDisplayName,
  validateInviteCode,
  validateOnboarding,
  validatePassword,
} from './validation'

const sessionDays = 30

type UserRow = {
  id: string
  studioId: string
  email: string
  displayName: string
  role: UserRole
  passwordSalt: string
  passwordHash: string
}

const corsHeaders = (request: Request, env: Env) => {
  const origin = request.headers.get('Origin')
  const allowed = env.CORS_ORIGINS.split(',').map((value) => value.trim())
  if (origin && !allowed.includes(origin)) {
    throw new HttpError(403, 'Origin nicht erlaubt.')
  }
  return {
    'Access-Control-Allow-Origin': origin ?? allowed[0] ?? '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

const responseHeaders = (request: Request, env: Env) => ({
  ...corsHeaders(request, env),
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
})

const json = (
  request: Request,
  env: Env,
  data: unknown,
  status = 200,
) =>
  Response.json(data, {
    status,
    headers: responseHeaders(request, env),
  })

const expiresAt = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

const createSession = async (userId: string, env: Env) => {
  const token = randomToken()
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token_digest, expires_at) VALUES (?, ?, ?, ?)',
  )
    .bind(crypto.randomUUID(), userId, await sha256(token), expiresAt(sessionDays))
    .run()
  return token
}

const findStudio = async (inviteCode: string, env: Env) =>
  env.DB.prepare(
    'SELECT id, name, city FROM studios WHERE invite_code_digest = ? AND active = 1',
  )
    .bind(await sha256(inviteCode))
    .first<{ id: string; name: string; city: string }>()

const publicUser = (user: SessionUser) => ({
  id: user.id,
  studioId: user.studioId,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
})

const authenticate = async (request: Request, env: Env) => {
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Anmeldung erforderlich.')
  }
  const token = authorization.slice('Bearer '.length).trim()
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new HttpError(401, 'Sitzung ist ungültig.')
  }
  const user = await env.DB.prepare(
    `SELECT
      u.id,
      u.studio_id AS studioId,
      u.email,
      u.display_name AS displayName,
      u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_digest = ?
      AND s.expires_at > CURRENT_TIMESTAMP
      AND u.active = 1`,
  )
    .bind(await sha256(token))
    .first<SessionUser>()
  if (!user) throw new HttpError(401, 'Sitzung ist abgelaufen.')
  return { user, token }
}

const requireRole = (user: SessionUser, roles: UserRole[]) => {
  if (!roles.includes(user.role)) {
    throw new HttpError(403, 'Keine Berechtigung.')
  }
}

const rateLimitKey = async (request: Request, email: string) => {
  const address = request.headers.get('CF-Connecting-IP') ?? 'local'
  return sha256(`${address}:${email}`)
}

const assertLoginAllowed = async (keyDigest: string, env: Env) => {
  const row = await env.DB.prepare(
    `SELECT attempts
     FROM auth_rate_limits
     WHERE key_digest = ? AND expires_at > CURRENT_TIMESTAMP`,
  )
    .bind(keyDigest)
    .first<{ attempts: number }>()
  if (row && row.attempts >= 8) {
    throw new HttpError(429, 'Zu viele Versuche. Bitte später erneut versuchen.')
  }
}

const recordLoginFailure = async (keyDigest: string, env: Env) => {
  const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  await env.DB.prepare(
    `INSERT INTO auth_rate_limits (key_digest, attempts, expires_at)
     VALUES (?, 1, ?)
     ON CONFLICT(key_digest) DO UPDATE SET
       attempts = CASE
         WHEN auth_rate_limits.expires_at <= CURRENT_TIMESTAMP THEN 1
         ELSE auth_rate_limits.attempts + 1
       END,
       expires_at = CASE
         WHEN auth_rate_limits.expires_at <= CURRENT_TIMESTAMP THEN excluded.expires_at
         ELSE auth_rate_limits.expires_at
       END,
       updated_at = CURRENT_TIMESTAMP`,
  )
    .bind(keyDigest, expiry)
    .run()
}

const register = async (request: Request, env: Env) => {
  const body = await readJson(request)
  const email = normalizeEmail(body.email)
  const password = validatePassword(body.password)
  const displayName = validateDisplayName(body.displayName)
  const inviteCode = validateInviteCode(body.inviteCode)
  const studio = await findStudio(inviteCode, env)
  if (!studio) throw new HttpError(404, 'Studio-Code nicht gefunden.')

  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE studio_id = ? AND email = ?',
  )
    .bind(studio.id, email)
    .first()
  if (existing) throw new HttpError(409, 'Für diese E-Mail besteht bereits ein Konto.')

  const userId = crypto.randomUUID()
  const passwordData = await hashPassword(password)
  await env.DB.prepare(
    `INSERT INTO users (
      id, studio_id, email, display_name, role, password_salt, password_hash
    ) VALUES (?, ?, ?, ?, 'member', ?, ?)`,
  )
    .bind(
      userId,
      studio.id,
      email,
      displayName,
      passwordData.salt,
      passwordData.hash,
    )
    .run()

  const token = await createSession(userId, env)
  return json(
    request,
    env,
    {
      token,
      user: {
        id: userId,
        studioId: studio.id,
        email,
        displayName,
        role: 'member',
      },
      studio: { id: studio.id, name: studio.name, city: studio.city },
    },
    201,
  )
}

const login = async (request: Request, env: Env) => {
  const body = await readJson(request)
  const email = normalizeEmail(body.email)
  const password = validatePassword(body.password)
  const inviteCode = validateInviteCode(body.inviteCode)
  const keyDigest = await rateLimitKey(request, email)
  await assertLoginAllowed(keyDigest, env)

  const studio = await findStudio(inviteCode, env)
  const user = studio
    ? await env.DB.prepare(
        `SELECT
          id,
          studio_id AS studioId,
          email,
          display_name AS displayName,
          role,
          password_salt AS passwordSalt,
          password_hash AS passwordHash
        FROM users
        WHERE studio_id = ? AND email = ? AND active = 1`,
      )
        .bind(studio.id, email)
        .first<UserRow>()
    : null

  if (
    !studio ||
    !user ||
    !(await verifyPassword(password, user.passwordSalt, user.passwordHash))
  ) {
    await recordLoginFailure(keyDigest, env)
    throw new HttpError(401, 'E-Mail, Passwort oder Studio-Code ist falsch.')
  }

  await env.DB.prepare('DELETE FROM auth_rate_limits WHERE key_digest = ?')
    .bind(keyDigest)
    .run()
  const token = await createSession(user.id, env)
  return json(request, env, {
    token,
    user: publicUser(user),
    studio: { id: studio.id, name: studio.name, city: studio.city },
  })
}

const logout = async (request: Request, env: Env) => {
  const session = await authenticate(request, env)
  await env.DB.prepare('DELETE FROM sessions WHERE token_digest = ?')
    .bind(await sha256(session.token))
    .run()
  return json(request, env, { ok: true })
}

const getPlan = async (userId: string, env: Env) => {
  const plan = await env.DB.prepare(
    `SELECT
      p.id,
      p.status,
      p.access_mode AS accessMode,
      p.created_at AS createdAt,
      t.id AS templateId,
      t.name AS templateName,
      t.days,
      t.duration
    FROM plans p
    JOIN training_templates t ON t.id = p.template_id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT 1`,
  )
    .bind(userId)
    .first<Record<string, unknown>>()
  if (!plan) return null
  const items = await env.DB.prepare(
    `SELECT
      pi.route_order AS routeOrder,
      pi.sets,
      pi.reps,
      m.id AS machineId,
      m.code AS machineCode,
      m.name_de AS machineName,
      m.zone,
      alt.id AS alternativeMachineId,
      alt.code AS alternativeMachineCode
    FROM plan_items pi
    JOIN machines m ON m.id = pi.machine_id
    LEFT JOIN machines alt ON alt.id = pi.alternative_machine_id
    WHERE pi.plan_id = ? AND m.active = 1
    ORDER BY pi.route_order`,
  )
    .bind(plan.id)
    .all()
  return { ...plan, items: items.results }
}

const saveOnboarding = async (request: Request, env: Env) => {
  const { user } = await authenticate(request, env)
  requireRole(user, ['member'])
  const input = validateOnboarding(await readJson(request))
  const template = await env.DB.prepare(
    `SELECT id
     FROM training_templates
     WHERE studio_id = ? AND active = 1
     ORDER BY
       CASE WHEN goal = ? THEN 0 WHEN goal = 'general' THEN 1 ELSE 2 END,
       CASE WHEN experience = ? THEN 0 WHEN experience = 'beginner' THEN 1 ELSE 2 END,
       ABS(days - ?) + (ABS(duration - ?) / 15.0)
     LIMIT 1`,
  )
    .bind(
      user.studioId,
      input.goal,
      input.experience,
      input.days,
      input.duration,
    )
    .first<{ id: string }>()
  if (!template) throw new HttpError(409, 'Keine freigegebene Vorlage verfügbar.')

  const planId = crypto.randomUUID()
  const mode = input.needsTrainer ? 'trainer_review' : 'starter'
  const status = input.needsTrainer ? 'pending_trainer_review' : 'generated'
  const statements = [
    env.DB.prepare(
      `INSERT INTO onboarding_answers (
        user_id, goal, experience, days, duration, focus_json, activity,
        safety_review_required, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        goal = excluded.goal,
        experience = excluded.experience,
        days = excluded.days,
        duration = excluded.duration,
        focus_json = excluded.focus_json,
        activity = excluded.activity,
        safety_review_required = excluded.safety_review_required,
        updated_at = CURRENT_TIMESTAMP`,
    ).bind(
      user.id,
      input.goal,
      input.experience,
      input.days,
      input.duration,
      JSON.stringify(input.focus),
      input.activity,
      input.needsTrainer ? 1 : 0,
    ),
    env.DB.prepare(
      `INSERT INTO plans (
        id, user_id, template_id, status, access_mode
      ) VALUES (?, ?, ?, ?, ?)`,
    ).bind(planId, user.id, template.id, status, mode),
    env.DB.prepare(
      `INSERT INTO plan_items (
        id, plan_id, machine_id, route_order, sets, reps
      )
      SELECT
        ? || '-' || machine_id,
        ?,
        machine_id,
        route_order,
        sets,
        reps
      FROM template_items
      WHERE template_id = ?`,
    ).bind(planId, planId, template.id),
  ]
  if (input.needsTrainer) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO trainer_review_requests (
          id, plan_id, user_id, status, safety_flag
        ) VALUES (?, ?, ?, 'pending', 1)`,
      ).bind(crypto.randomUUID(), planId, user.id),
    )
  }
  await env.DB.batch(statements)
  return json(request, env, { plan: await getPlan(user.id, env) }, 201)
}

const activatePlan = async (request: Request, env: Env) => {
  const { user } = await authenticate(request, env)
  requireRole(user, ['member'])
  const body = await readJson(request)
  if (body.mode !== 'starter' && body.mode !== 'trainer_review') {
    throw new HttpError(400, 'Planmodus ist ungültig.')
  }
  const current = await env.DB.prepare(
    `SELECT
      p.id,
      COALESCE(o.safety_review_required, 0) AS safetyReviewRequired
    FROM plans p
    LEFT JOIN onboarding_answers o ON o.user_id = p.user_id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT 1`,
  )
    .bind(user.id)
    .first<{ id: string; safetyReviewRequired: number }>()
  if (!current) throw new HttpError(404, 'Plan nicht gefunden.')
  if (body.mode === 'starter' && current.safetyReviewRequired === 1) {
    throw new HttpError(409, 'Trainer-Prüfung ist vor dem Start erforderlich.')
  }

  if (body.mode === 'starter') {
    await env.DB.prepare(
      `UPDATE plans
       SET status = 'starter_active', access_mode = 'starter', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
      .bind(current.id)
      .run()
  } else {
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE plans
         SET status = 'pending_trainer_review',
             access_mode = 'trainer_review',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      ).bind(current.id),
      env.DB.prepare(
        `INSERT INTO trainer_review_requests (
          id, plan_id, user_id, status, safety_flag
        ) VALUES (?, ?, ?, 'pending', ?)
        ON CONFLICT(plan_id) DO UPDATE SET status = 'pending'`,
      ).bind(
        crypto.randomUUID(),
        current.id,
        user.id,
        current.safetyReviewRequired,
      ),
    ])
  }
  return json(request, env, { plan: await getPlan(user.id, env) })
}

const saveWorkout = async (request: Request, env: Env) => {
  const { user } = await authenticate(request, env)
  requireRole(user, ['member'])
  const body = await readJson(request)
  if (typeof body.machineId !== 'string') {
    throw new HttpError(400, 'Gerät fehlt.')
  }
  if (
    typeof body.weight !== 'number' ||
    !Number.isFinite(body.weight) ||
    body.weight <= 0 ||
    body.weight >= 1000
  ) {
    throw new HttpError(400, 'Gewicht ist ungültig.')
  }
  if (
    !Array.isArray(body.reps) ||
    body.reps.length < 1 ||
    body.reps.length > 10 ||
    !body.reps.every(
      (value) => Number.isInteger(value) && Number(value) > 0 && Number(value) <= 100,
    )
  ) {
    throw new HttpError(400, 'Wiederholungen sind ungültig.')
  }
  const machine = await env.DB.prepare(
    'SELECT id FROM machines WHERE id = ? AND studio_id = ? AND active = 1',
  )
    .bind(body.machineId, user.studioId)
    .first()
  if (!machine) throw new HttpError(404, 'Gerät nicht gefunden.')
  const plan = await env.DB.prepare(
    `SELECT id FROM plans
     WHERE user_id = ? AND status IN ('starter_active', 'published')
     ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(user.id)
    .first<{ id: string }>()
  if (!plan) throw new HttpError(409, 'Kein aktiver Plan vorhanden.')
  const completedAt =
    typeof body.completedAt === 'string' &&
    !Number.isNaN(Date.parse(body.completedAt))
      ? new Date(body.completedAt).toISOString()
      : new Date().toISOString()
  const logId = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO workout_logs (
      id, user_id, plan_id, machine_id, weight_kg, reps_json, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      logId,
      user.id,
      plan.id,
      body.machineId,
      body.weight,
      JSON.stringify(body.reps),
      completedAt,
    )
    .run()
  return json(request, env, { id: logId, completedAt }, 201)
}

const listWorkouts = async (request: Request, env: Env) => {
  const { user } = await authenticate(request, env)
  requireRole(user, ['member'])
  const result = await env.DB.prepare(
    `SELECT
      w.id,
      w.machine_id AS machineId,
      m.name_de AS machineName,
      w.weight_kg AS weight,
      w.reps_json AS repsJson,
      w.completed_at AS completedAt
    FROM workout_logs w
    JOIN machines m ON m.id = w.machine_id
    WHERE w.user_id = ?
    ORDER BY w.completed_at DESC
    LIMIT 100`,
  )
    .bind(user.id)
    .all<Record<string, unknown> & { repsJson: string }>()
  return json(request, env, {
    workouts: result.results.map(({ repsJson, ...row }) => ({
      ...row,
      reps: JSON.parse(repsJson),
    })),
  })
}

const listReviews = async (request: Request, env: Env) => {
  const { user } = await authenticate(request, env)
  requireRole(user, ['trainer', 'studio_admin'])
  const result = await env.DB.prepare(
    `SELECT
      r.id,
      r.plan_id AS planId,
      r.safety_flag AS safetyFlag,
      r.created_at AS createdAt,
      u.id AS userId,
      u.display_name AS displayName,
      u.email,
      t.name AS templateName
    FROM trainer_review_requests r
    JOIN users u ON u.id = r.user_id
    JOIN plans p ON p.id = r.plan_id
    JOIN training_templates t ON t.id = p.template_id
    WHERE r.status = 'pending' AND u.studio_id = ?
    ORDER BY r.created_at`,
  )
    .bind(user.studioId)
    .all()
  return json(request, env, { reviews: result.results })
}

const publishReview = async (
  request: Request,
  env: Env,
  reviewId: string,
) => {
  const { user } = await authenticate(request, env)
  requireRole(user, ['trainer', 'studio_admin'])
  const review = await env.DB.prepare(
    `SELECT r.id, r.plan_id AS planId
     FROM trainer_review_requests r
     JOIN users member ON member.id = r.user_id
     WHERE r.id = ? AND r.status = 'pending' AND member.studio_id = ?`,
  )
    .bind(reviewId, user.studioId)
    .first<{ id: string; planId: string }>()
  if (!review) throw new HttpError(404, 'Prüfanfrage nicht gefunden.')
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE plans
       SET status = 'published',
           published_by = ?,
           published_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    ).bind(user.id, review.planId),
    env.DB.prepare(
      `UPDATE trainer_review_requests
       SET status = 'published',
           reviewed_at = CURRENT_TIMESTAMP,
           reviewed_by = ?
       WHERE id = ?`,
    ).bind(user.id, review.id),
  ])
  return json(request, env, { ok: true })
}

const route = async (request: Request, env: Env) => {
  const url = new URL(request.url)
  const key = `${request.method} ${url.pathname}`
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) })
  }
  if (key === 'GET /health') {
    return json(request, env, {
      ok: true,
      service: 'fitpath-api',
      environment: env.ENVIRONMENT,
    })
  }
  if (key === 'POST /v1/auth/register') return register(request, env)
  if (key === 'POST /v1/auth/login') return login(request, env)
  if (key === 'POST /v1/auth/logout') return logout(request, env)
  if (key === 'GET /v1/me') {
    const { user } = await authenticate(request, env)
    return json(request, env, { user: publicUser(user) })
  }
  if (key === 'POST /v1/onboarding') return saveOnboarding(request, env)
  if (key === 'GET /v1/plans/current') {
    const { user } = await authenticate(request, env)
    return json(request, env, { plan: await getPlan(user.id, env) })
  }
  if (key === 'POST /v1/plans/activate') return activatePlan(request, env)
  if (key === 'POST /v1/workouts') return saveWorkout(request, env)
  if (key === 'GET /v1/workouts') return listWorkouts(request, env)
  if (key === 'GET /v1/trainer/reviews') return listReviews(request, env)
  const publishMatch = url.pathname.match(/^\/v1\/trainer\/reviews\/([^/]+)\/publish$/)
  if (request.method === 'POST' && publishMatch) {
    return publishReview(request, env, publishMatch[1])
  }
  throw new HttpError(404, 'Route nicht gefunden.')
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env)
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      const message =
        error instanceof HttpError ? error.message : 'Interner Serverfehler.'
      if (!(error instanceof HttpError)) console.error(error)
      try {
        return json(request, env, { error: message }, status)
      } catch {
        return Response.json({ error: message }, { status })
      }
    }
  },
} satisfies ExportedHandler<Env>
