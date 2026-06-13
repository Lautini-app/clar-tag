CREATE TABLE public.workflow_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  workflow_id uuid NULL,
  workflow_key text NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own completions" ON public.workflow_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own completions" ON public.workflow_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own completions" ON public.workflow_completions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_workflow_completions_user_time
  ON public.workflow_completions (user_id, completed_at DESC);