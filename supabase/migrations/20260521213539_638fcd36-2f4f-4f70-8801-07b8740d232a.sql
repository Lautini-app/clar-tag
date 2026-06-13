-- Stage enum
CREATE TYPE public.family_stage AS ENUM ('begleitet', 'unterstuetzt', 'selbststaendig');
CREATE TYPE public.invite_kind AS ENUM ('pin', 'email');

-- Families
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Familie',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Members
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '👤',
  stage public.family_stage NOT NULL DEFAULT 'selbststaendig',
  toggles JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
CREATE INDEX idx_family_members_family ON public.family_members(family_id);
CREATE INDEX idx_family_members_user ON public.family_members(user_id) WHERE user_id IS NOT NULL;

-- Invites
CREATE TABLE public.family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  kind public.invite_kind NOT NULL,
  pin_hash TEXT,
  email TEXT,
  token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_family_invites_member ON public.family_invites(member_id);
CREATE INDEX idx_family_invites_token ON public.family_invites(token) WHERE token IS NOT NULL;

-- Member status (live view for admin)
CREATE TABLE public.family_member_status (
  member_id UUID PRIMARY KEY REFERENCES public.family_members(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  current_step INT,
  total_steps INT,
  finished_at TIMESTAMPTZ,
  workflow_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper: is the calling user the admin of this family?
CREATE OR REPLACE FUNCTION public.is_family_admin(_family_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.families
    WHERE id = _family_id AND admin_user_id = auth.uid()
  );
$$;

-- Helper: is the calling user a member of this family?
CREATE OR REPLACE FUNCTION public.is_family_member(_family_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = _family_id AND user_id = auth.uid()
  );
$$;

-- RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_member_status ENABLE ROW LEVEL SECURITY;

-- families: admin full, members read
CREATE POLICY "Admin manages own family" ON public.families
  FOR ALL TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());

CREATE POLICY "Members read their family" ON public.families
  FOR SELECT TO authenticated
  USING (public.is_family_member(id));

-- family_members: admin full
CREATE POLICY "Admin manages members" ON public.family_members
  FOR ALL TO authenticated
  USING (public.is_family_admin(family_id))
  WITH CHECK (public.is_family_admin(family_id));

-- member can read own family members
CREATE POLICY "Members read siblings" ON public.family_members
  FOR SELECT TO authenticated
  USING (public.is_family_member(family_id));

-- family_invites: admin full, no member access
CREATE POLICY "Admin manages invites" ON public.family_invites
  FOR ALL TO authenticated
  USING (public.is_family_admin(family_id))
  WITH CHECK (public.is_family_admin(family_id));

-- family_member_status: admin reads all in family, member writes/reads own
CREATE POLICY "Admin reads family status" ON public.family_member_status
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.id = member_id AND public.is_family_admin(fm.family_id)
    )
  );

CREATE POLICY "Member reads own status" ON public.family_member_status
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.id = member_id AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Member writes own status" ON public.family_member_status
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.id = member_id AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Member updates own status" ON public.family_member_status
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.id = member_id AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin updates family status" ON public.family_member_status
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.id = member_id AND public.is_family_admin(fm.family_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.id = member_id AND public.is_family_admin(fm.family_id)
    )
  );

-- updated_at trigger for status
CREATE TRIGGER update_family_member_status_updated_at
  BEFORE UPDATE ON public.family_member_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- claim_pin: callable by any authenticated user (incl. fresh anonymous user).
-- Verifies PIN against active invite, links calling user to the member row.
CREATE OR REPLACE FUNCTION public.claim_pin(_pin TEXT)
RETURNS TABLE(member_id UUID, family_id UUID, name TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
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

  SELECT i.*, fm.user_id AS member_user_id, fm.name AS member_name
    INTO _invite
  FROM public.family_invites i
  JOIN public.family_members fm ON fm.id = i.member_id
  WHERE i.kind = 'pin'
    AND i.used_at IS NULL
    AND i.expires_at > now()
    AND i.pin_hash = extensions.crypt(_pin, i.pin_hash)
  LIMIT 1;

  IF _invite IS NULL THEN
    RAISE EXCEPTION 'PIN ungültig oder abgelaufen';
  END IF;

  -- Refuse if this user is already linked to a different member
  IF EXISTS (SELECT 1 FROM public.family_members WHERE user_id = _uid AND id <> _invite.member_id) THEN
    RAISE EXCEPTION 'Dieses Gerät ist bereits mit einem anderen Mitglied verbunden';
  END IF;

  UPDATE public.family_members SET user_id = _uid WHERE id = _invite.member_id;
  UPDATE public.family_invites SET used_at = now() WHERE id = _invite.id;

  RETURN QUERY SELECT _invite.member_id, _invite.family_id, _invite.member_name;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_pin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_pin(TEXT) TO authenticated;

-- Ensure pgcrypto is available for PIN hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;