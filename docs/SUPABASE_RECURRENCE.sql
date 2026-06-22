-- Recurrence rules for workflow schedules
-- Run this migration in the Supabase SQL editor for schema clar_tag.
-- =========================

-- 1. New table: recurrence rules
CREATE TABLE public.workflow_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  workflow_key TEXT,
  recurrence_type TEXT NOT NULL DEFAULT 'once'
    CHECK (recurrence_type IN ('once','daily','weekly','custom')),
  recurrence_days INTEGER[] NOT NULL DEFAULT '{}',
  recurrence_time TIME NOT NULL DEFAULT '08:00',
  recurrence_start DATE NOT NULL DEFAULT CURRENT_DATE,
  recurrence_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recurrences_user ON public.workflow_recurrences(user_id);

ALTER TABLE public.workflow_recurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own recurrences" ON public.workflow_recurrences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own recurrences" ON public.workflow_recurrences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own recurrences" ON public.workflow_recurrences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own recurrences" ON public.workflow_recurrences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 2. Add parent_recurrence_id to workflow_schedules
ALTER TABLE public.workflow_schedules
  ADD COLUMN IF NOT EXISTS parent_recurrence_id UUID
    REFERENCES public.workflow_recurrences(id) ON DELETE CASCADE;

CREATE INDEX idx_schedules_recurrence
  ON public.workflow_schedules(parent_recurrence_id)
  WHERE parent_recurrence_id IS NOT NULL;
