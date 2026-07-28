PRAGMA foreign_keys = ON;

CREATE TABLE studios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  invite_code_digest TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  studio_id TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('member', 'trainer', 'studio_admin')),
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (studio_id, email),
  FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_digest TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE auth_rate_limits (
  key_digest TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onboarding_answers (
  user_id TEXT PRIMARY KEY,
  goal TEXT NOT NULL CHECK (goal IN ('general', 'muscle', 'weight', 'endurance')),
  experience TEXT NOT NULL CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  days INTEGER NOT NULL CHECK (days BETWEEN 2 AND 5),
  duration INTEGER NOT NULL CHECK (duration IN (30, 45, 60, 90)),
  focus_json TEXT NOT NULL,
  activity TEXT NOT NULL,
  safety_review_required INTEGER NOT NULL CHECK (safety_review_required IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE machines (
  id TEXT PRIMARY KEY,
  studio_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name_de TEXT NOT NULL,
  zone TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  route_order INTEGER NOT NULL,
  alternative_machine_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (studio_id, code),
  FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE,
  FOREIGN KEY (alternative_machine_id) REFERENCES machines(id)
);

CREATE TABLE training_templates (
  id TEXT PRIMARY KEY,
  studio_id TEXT NOT NULL,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  experience TEXT NOT NULL,
  days INTEGER NOT NULL CHECK (days BETWEEN 2 AND 5),
  duration INTEGER NOT NULL CHECK (duration IN (30, 45, 60, 90)),
  approved_by TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE template_items (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  route_order INTEGER NOT NULL,
  sets INTEGER NOT NULL CHECK (sets BETWEEN 1 AND 10),
  reps TEXT NOT NULL,
  UNIQUE (template_id, route_order),
  FOREIGN KEY (template_id) REFERENCES training_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id)
);

CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('generated', 'starter_active', 'pending_trainer_review', 'published', 'locked')),
  access_mode TEXT NOT NULL CHECK (access_mode IN ('starter', 'trainer_review')),
  published_by TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES training_templates(id),
  FOREIGN KEY (published_by) REFERENCES users(id)
);

CREATE TABLE plan_items (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  route_order INTEGER NOT NULL,
  sets INTEGER NOT NULL CHECK (sets BETWEEN 1 AND 10),
  reps TEXT NOT NULL,
  alternative_machine_id TEXT,
  UNIQUE (plan_id, route_order),
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (machine_id) REFERENCES machines(id),
  FOREIGN KEY (alternative_machine_id) REFERENCES machines(id)
);

CREATE TABLE trainer_review_requests (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'published', 'cancelled')),
  safety_flag INTEGER NOT NULL CHECK (safety_flag IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE workout_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT,
  machine_id TEXT NOT NULL,
  weight_kg REAL NOT NULL CHECK (weight_kg > 0 AND weight_kg < 1000),
  reps_json TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  FOREIGN KEY (machine_id) REFERENCES machines(id)
);

CREATE TABLE push_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_digest TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_studio_email ON users(studio_id, email);
CREATE INDEX idx_sessions_token_expires ON sessions(token_digest, expires_at);
CREATE INDEX idx_templates_match ON training_templates(studio_id, goal, experience, days, duration, active);
CREATE INDEX idx_plans_user_created ON plans(user_id, created_at DESC);
CREATE INDEX idx_reviews_status_created ON trainer_review_requests(status, created_at);
CREATE INDEX idx_workouts_user_completed ON workout_logs(user_id, completed_at DESC);

INSERT INTO studios (id, name, city, invite_code_digest)
VALUES (
  'studio-pilot-vaihingen',
  'Pilot Studio',
  'Vaihingen/Enz',
  'be9f2d08740ce40f966c5998997be76cda4c78f26e615d2fd07ac7484890c731'
);

INSERT INTO machines (id, studio_id, code, name_de, zone, muscle_group, route_order) VALUES
  ('leg-press', 'studio-pilot-vaihingen', 'M04', 'Beinpresse', 'Kraft · Zone A', 'legs', 1),
  ('chest-press', 'studio-pilot-vaihingen', 'M07', 'Brustpresse', 'Kraft · Zone B', 'chest', 2),
  ('lat-pulldown', 'studio-pilot-vaihingen', 'M12', 'Latzug', 'Kraft · Zone C', 'back', 3),
  ('seated-row', 'studio-pilot-vaihingen', 'M15', 'Rudermaschine', 'Kraft · Zone C', 'back', 4),
  ('abdominal', 'studio-pilot-vaihingen', 'M23', 'Bauchmaschine', 'Functional · Zone E', 'core', 5);

INSERT INTO training_templates (id, studio_id, name, goal, experience, days, duration) VALUES
  ('balanced-2-30', 'studio-pilot-vaihingen', 'Balanced Compact', 'general', 'beginner', 2, 30),
  ('balanced-2-45', 'studio-pilot-vaihingen', 'Balanced Start', 'general', 'beginner', 2, 45),
  ('strength-3-60', 'studio-pilot-vaihingen', 'Strength Foundation', 'muscle', 'beginner', 3, 60),
  ('active-3-45', 'studio-pilot-vaihingen', 'Active Routine', 'weight', 'beginner', 3, 45),
  ('endurance-3-45', 'studio-pilot-vaihingen', 'Endurance Circuit', 'endurance', 'beginner', 3, 45);

INSERT INTO template_items (id, template_id, machine_id, route_order, sets, reps)
SELECT template_id || '-' || machine_id, template_id, machine_id, route_order,
  CASE WHEN template_id = 'balanced-2-30' THEN 2 ELSE 3 END,
  CASE WHEN machine_id = 'abdominal' THEN '10–15' ELSE '8–12' END
FROM (
  SELECT t.id AS template_id, m.id AS machine_id, m.route_order
  FROM training_templates t
  CROSS JOIN machines m
  WHERE t.studio_id = m.studio_id
);
