-- =============================================================
-- clar · tag — Schema-Migration für cgwpzpnklxphqxlixtva
-- Zielschema: clar_tag (kein public!)
-- Auszuführen im Supabase SQL-Editor von cgwpzpnklxphqxlixtva
-- =============================================================

-- Voraussetzung: pgcrypto muss in 'extensions' verfügbar sein (Supabase-Default).
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- =============================================================
-- 0. Schema + Grants
-- =============================================================
CREATE SCHEMA IF NOT EXISTS clar_tag;

GRANT USAGE ON SCHEMA clar_tag TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA clar_tag
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA clar_tag
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA clar_tag
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA clar_tag
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- WICHTIG: nach Ausführung im Supabase-Dashboard
--   Project Settings → API → "Exposed schemas"
--   'clar_tag' zur Liste hinzufügen (neben public, clar_heim, clar_markt).
-- Sonst gibt PostgREST 404 / Schema not exposed.

-- =============================================================
-- 1. Shared trigger function (im Schema clar_tag)
-- =============================================================
CREATE OR REPLACE FUNCTION clar_tag.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = clar_tag AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION clar_tag.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- =============================================================
-- 2. profiles
-- =============================================================
CREATE TABLE clar_tag.profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON clar_tag.profiles TO authenticated;
GRANT ALL ON clar_tag.profiles TO service_role;

ALTER TABLE clar_tag.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile"   ON clar_tag.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON clar_tag.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON clar_tag.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON clar_tag.profiles
  FOR EACH ROW EXECUTE FUNCTION clar_tag.update_updated_at_column();

-- Auto-create profile on signup (Trigger lebt in 'public' nicht möglich,
-- aber Funktion kann im clar_tag-Schema liegen; Trigger auf auth.users zeigt darauf)
CREATE OR REPLACE FUNCTION clar_tag.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = clar_tag AS $$
BEGIN
  INSERT INTO clar_tag.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION clar_tag.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Trigger-Name pro App eindeutig (clar.heim/clar.markt nutzen den Namen evtl. auch)
CREATE TRIGGER on_auth_user_created_clar_tag
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION clar_tag.handle_new_user();

-- =============================================================
-- 3. workflows / schedules / completions
-- =============================================================
CREATE TABLE clar_tag.workflows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'sonstiges',
  icon        TEXT,
  steps       JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workflows_user ON clar_tag.workflows(user_id) WHERE is_archived = false;
GRANT SELECT, INSERT, UPDATE, DELETE ON clar_tag.workflows TO authenticated;
GRANT ALL ON clar_tag.workflows TO service_role;
ALTER TABLE clar_tag.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own workflows"   ON clar_tag.workflows FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own workflows" ON clar_tag.workflows FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own workflows" ON clar_tag.workflows FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own workflows" ON clar_tag.workflows FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_workflows_updated_at
  BEFORE UPDATE ON clar_tag.workflows
  FOR EACH ROW EXECUTE FUNCTION clar_tag.update_updated_at_column();

CREATE TABLE clar_tag.workflow_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id  UUID REFERENCES clar_tag.workflows(id) ON DELETE SET NULL,
  workflow_key TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','done','skipped')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_schedules_user_time ON clar_tag.workflow_schedules(user_id, scheduled_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON clar_tag.workflow_schedules TO authenticated;
GRANT ALL ON clar_tag.workflow_schedules TO service_role;
ALTER TABLE clar_tag.workflow_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own schedules"   ON clar_tag.workflow_schedules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own schedules" ON clar_tag.workflow_schedules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own schedules" ON clar_tag.workflow_schedules FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own schedules" ON clar_tag.workflow_schedules FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE clar_tag.workflow_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  workflow_id  UUID,
  workflow_key TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workflow_completions_user_time ON clar_tag.workflow_completions(user_id, completed_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON clar_tag.workflow_completions TO authenticated;
GRANT ALL ON clar_tag.workflow_completions TO service_role;
ALTER TABLE clar_tag.workflow_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own completions"   ON clar_tag.workflow_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own completions" ON clar_tag.workflow_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own completions" ON clar_tag.workflow_completions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- 4. Family mode (Enums + Tables)
-- =============================================================
CREATE TYPE clar_tag.family_stage AS ENUM ('begleitet', 'unterstuetzt', 'selbststaendig');
CREATE TYPE clar_tag.invite_kind  AS ENUM ('pin', 'email');

CREATE TABLE clar_tag.families (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  name          TEXT NOT NULL DEFAULT 'Familie',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON clar_tag.families TO authenticated;
GRANT ALL ON clar_tag.families TO service_role;

CREATE TABLE clar_tag.family_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID NOT NULL REFERENCES clar_tag.families(id) ON DELETE CASCADE,
  user_id    UUID UNIQUE,
  name       TEXT NOT NULL,
  emoji      TEXT NOT NULL DEFAULT '👤',
  stage      clar_tag.family_stage NOT NULL DEFAULT 'selbststaendig',
  toggles    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_family_members_family ON clar_tag.family_members(family_id);
CREATE INDEX idx_family_members_user   ON clar_tag.family_members(user_id) WHERE user_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON clar_tag.family_members TO authenticated;
GRANT ALL ON clar_tag.family_members TO service_role;

CREATE TABLE clar_tag.family_invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID NOT NULL REFERENCES clar_tag.families(id) ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES clar_tag.family_members(id) ON DELETE CASCADE,
  kind       clar_tag.invite_kind NOT NULL,
  pin_hash   TEXT,
  email      TEXT,
  token      TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_family_invites_member ON clar_tag.family_invites(member_id);
CREATE INDEX idx_family_invites_token  ON clar_tag.family_invites(token) WHERE token IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON clar_tag.family_invites TO authenticated;
GRANT ALL ON clar_tag.family_invites TO service_role;

CREATE TABLE clar_tag.family_member_status (
  member_id     UUID PRIMARY KEY REFERENCES clar_tag.family_members(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ,
  current_step  INT,
  total_steps   INT,
  finished_at   TIMESTAMPTZ,
  workflow_name TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON clar_tag.family_member_status TO authenticated;
GRANT ALL ON clar_tag.family_member_status TO service_role;

CREATE TRIGGER update_family_member_status_updated_at
  BEFORE UPDATE ON clar_tag.family_member_status
  FOR EACH ROW EXECUTE FUNCTION clar_tag.update_updated_at_column();

-- =============================================================
-- 5. Helper-Funktionen (SECURITY DEFINER — vermeiden RLS-Rekursion)
-- =============================================================
CREATE OR REPLACE FUNCTION clar_tag.is_family_admin(_family_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = clar_tag AS $$
  SELECT EXISTS (
    SELECT 1 FROM clar_tag.families
    WHERE id = _family_id AND admin_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION clar_tag.is_family_member(_family_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = clar_tag AS $$
  SELECT EXISTS (
    SELECT 1 FROM clar_tag.family_members
    WHERE family_id = _family_id AND user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION clar_tag.is_family_admin(uuid)  TO authenticated;
GRANT EXECUTE ON FUNCTION clar_tag.is_family_member(uuid) TO authenticated;

-- =============================================================
-- 6. RLS für Family-Tabellen
-- =============================================================
ALTER TABLE clar_tag.families             ENABLE ROW LEVEL SECURITY;
ALTER TABLE clar_tag.family_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clar_tag.family_invites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clar_tag.family_member_status ENABLE ROW LEVEL SECURITY;

-- families
CREATE POLICY "Admin manages own family"  ON clar_tag.families
  FOR ALL TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());

CREATE POLICY "Members read their family" ON clar_tag.families
  FOR SELECT TO authenticated
  USING (clar_tag.is_family_member(id));

-- family_members
CREATE POLICY "Admin manages members"  ON clar_tag.family_members
  FOR ALL TO authenticated
  USING (clar_tag.is_family_admin(family_id))
  WITH CHECK (clar_tag.is_family_admin(family_id));

CREATE POLICY "Members read siblings"  ON clar_tag.family_members
  FOR SELECT TO authenticated
  USING (clar_tag.is_family_member(family_id));

-- family_invites (nur Admin)
CREATE POLICY "Admin manages invites" ON clar_tag.family_invites
  FOR ALL TO authenticated
  USING (clar_tag.is_family_admin(family_id))
  WITH CHECK (clar_tag.is_family_admin(family_id));

-- family_member_status
CREATE POLICY "Admin reads family status" ON clar_tag.family_member_status
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clar_tag.family_members fm
    WHERE fm.id = member_id AND clar_tag.is_family_admin(fm.family_id)
  ));

CREATE POLICY "Admin updates family status" ON clar_tag.family_member_status
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clar_tag.family_members fm
    WHERE fm.id = member_id AND clar_tag.is_family_admin(fm.family_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clar_tag.family_members fm
    WHERE fm.id = member_id AND clar_tag.is_family_admin(fm.family_id)
  ));

CREATE POLICY "Member reads own status" ON clar_tag.family_member_status
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clar_tag.family_members fm
    WHERE fm.id = member_id AND fm.user_id = auth.uid()
  ));

CREATE POLICY "Member writes own status" ON clar_tag.family_member_status
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM clar_tag.family_members fm
    WHERE fm.id = member_id AND fm.user_id = auth.uid()
  ));

CREATE POLICY "Member updates own status" ON clar_tag.family_member_status
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clar_tag.family_members fm
    WHERE fm.id = member_id AND fm.user_id = auth.uid()
  ));

-- =============================================================
-- 7. PIN-Invite RPCs
-- =============================================================
CREATE OR REPLACE FUNCTION clar_tag.create_pin_invite(_member_id uuid)
RETURNS TABLE(pin text, expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = clar_tag, extensions AS $$
DECLARE
  _family_id UUID;
  _pin TEXT;
  _expires TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT fm.family_id INTO _family_id
  FROM clar_tag.family_members fm
  JOIN clar_tag.families f ON f.id = fm.family_id
  WHERE fm.id = _member_id AND f.admin_user_id = auth.uid();

  IF _family_id IS NULL THEN
    RAISE EXCEPTION 'Mitglied nicht gefunden oder keine Berechtigung';
  END IF;

  UPDATE clar_tag.family_invites
     SET used_at = now()
   WHERE member_id = _member_id AND kind = 'pin' AND used_at IS NULL;

  _pin := lpad((floor(random() * 1000000))::int::text, 6, '0');
  _expires := now() + interval '24 hours';

  INSERT INTO clar_tag.family_invites (family_id, member_id, kind, pin_hash, expires_at)
  VALUES (_family_id, _member_id, 'pin',
          extensions.crypt(_pin, extensions.gen_salt('bf')), _expires);

  RETURN QUERY SELECT _pin, _expires;
END;
$$;

CREATE OR REPLACE FUNCTION clar_tag.claim_pin(_pin text)
RETURNS TABLE(member_id uuid, family_id uuid, name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = clar_tag, extensions AS $$
DECLARE
  _invite RECORD;
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _pin !~ '^[0-9]{6}$' THEN
    RAISE EXCEPTION 'Invalid PIN format';
  END IF;

  SELECT i.*, fm.user_id AS member_user_id, fm.name AS member_name INTO _invite
  FROM clar_tag.family_invites i
  JOIN clar_tag.family_members fm ON fm.id = i.member_id
  WHERE i.kind = 'pin'
    AND i.used_at IS NULL
    AND i.expires_at > now()
    AND i.pin_hash = extensions.crypt(_pin, i.pin_hash)
  LIMIT 1;

  IF _invite IS NULL THEN
    RAISE EXCEPTION 'PIN ungültig oder abgelaufen';
  END IF;

  IF EXISTS (
    SELECT 1 FROM clar_tag.family_members
    WHERE user_id = _uid AND id <> _invite.member_id
  ) THEN
    RAISE EXCEPTION 'Dieses Gerät ist bereits mit einem anderen Mitglied verbunden';
  END IF;

  UPDATE clar_tag.family_members SET user_id = _uid WHERE id = _invite.member_id;
  UPDATE clar_tag.family_invites SET used_at = now() WHERE id = _invite.id;

  RETURN QUERY SELECT _invite.member_id, _invite.family_id, _invite.member_name;
END;
$$;

GRANT EXECUTE ON FUNCTION clar_tag.create_pin_invite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION clar_tag.claim_pin(text)         TO authenticated;

-- =============================================================
-- 8. Nach dem Ausführen — manuelle Schritte im Supabase-Dashboard
-- =============================================================
--  a) Project Settings → API → "Exposed schemas"
--     Liste erweitern um: clar_tag
--     Speichern, ein paar Sekunden warten bis PostgREST neu lädt.
--
--  b) Authentication → Providers
--     - Email Provider: aktivieren
--     - "Confirm email" beim Magic Link irrelevant (OTP-Link ist die Bestätigung)
--     - Anonymous Sign-In: aktivieren (für PIN-Pairing)
--
--  c) Authentication → URL Configuration
--     - Site URL: https://<deine-app-domain>
--     - Redirect URLs: https://<deine-app-domain>/*, http://localhost:8080/*
--
--  d) TypeScript-Types neu generieren (lokal):
--     supabase gen types typescript --project-id cgwpzpnklxphqxlixtva --schema clar_tag > src/integrations/supabase/types.ts
--
-- Fertig. Der App-Client muss mit { db: { schema: 'clar_tag' } } initialisiert werden.
