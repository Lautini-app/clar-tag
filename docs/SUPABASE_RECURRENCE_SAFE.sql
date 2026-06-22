-- Recurrence rules for workflow schedules
-- Safe/idempotent migration for schema clar_tag.
-- Run in Supabase SQL editor.
-- =========================

SET search_path = clar_tag;

-- 1. New table: recurrence rules
CREATE TABLE IF NOT EXISTS clar_tag.workflow_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES clar_tag.workflows(id) ON DELETE SET NULL,
  workflow_key TEXT,
  recurrence_type TEXT NOT NULL DEFAULT 'once'
    CHECK (recurrence_type IN ('once','daily','weekly','custom')),
  recurrence_days INTEGER[] NOT NULL DEFAULT '{}',
  recurrence_time TIME NOT NULL DEFAULT '08:00',
  recurrence_start DATE NOT NULL DEFAULT CURRENT_DATE,
  recurrence_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurrences_user ON clar_tag.workflow_recurrences(user_id);

ALTER TABLE clar_tag.workflow_recurrences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own recurrences' AND tablename = 'workflow_recurrences') THEN
    CREATE POLICY "Users view own recurrences" ON clar_tag.workflow_recurrences
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users insert own recurrences' AND tablename = 'workflow_recurrences') THEN
    CREATE POLICY "Users insert own recurrences" ON clar_tag.workflow_recurrences
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own recurrences' AND tablename = 'workflow_recurrences') THEN
    CREATE POLICY "Users update own recurrences" ON clar_tag.workflow_recurrences
      FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own recurrences' AND tablename = 'workflow_recurrences') THEN
    CREATE POLICY "Users delete own recurrences" ON clar_tag.workflow_recurrences
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;


-- 2. Add parent_recurrence_id to workflow_schedules
ALTER TABLE clar_tag.workflow_schedules
  ADD COLUMN IF NOT EXISTS parent_recurrence_id UUID
    REFERENCES clar_tag.workflow_recurrences(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_schedules_recurrence
  ON clar_tag.workflow_schedules(parent_recurrence_id)
  WHERE parent_recurrence_id IS NOT NULL;


-- 3. Calendar token for iCal feed
CREATE TABLE IF NOT EXISTS clar_tag.calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_tokens_token ON clar_tag.calendar_tokens(token);

ALTER TABLE clar_tag.calendar_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own calendar token' AND tablename = 'calendar_tokens') THEN
    CREATE POLICY "Users view own calendar token" ON clar_tag.calendar_tokens
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users insert own calendar token' AND tablename = 'calendar_tokens') THEN
    CREATE POLICY "Users insert own calendar token" ON clar_tag.calendar_tokens
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own calendar token' AND tablename = 'calendar_tokens') THEN
    CREATE POLICY "Users delete own calendar token" ON clar_tag.calendar_tokens
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
