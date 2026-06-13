CREATE OR REPLACE FUNCTION public.create_pin_invite(_member_id UUID)
RETURNS TABLE(pin TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  _family_id UUID;
  _pin TEXT;
  _expires TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT fm.family_id INTO _family_id
  FROM public.family_members fm
  JOIN public.families f ON f.id = fm.family_id
  WHERE fm.id = _member_id AND f.admin_user_id = auth.uid();

  IF _family_id IS NULL THEN
    RAISE EXCEPTION 'Mitglied nicht gefunden oder keine Berechtigung';
  END IF;

  -- Invalidate prior unused PIN invites for this member
  UPDATE public.family_invites
     SET used_at = now()
   WHERE member_id = _member_id AND kind = 'pin' AND used_at IS NULL;

  -- Generate 6-digit numeric PIN (zero-padded)
  _pin := lpad((floor(random() * 1000000))::int::text, 6, '0');
  _expires := now() + interval '24 hours';

  INSERT INTO public.family_invites (family_id, member_id, kind, pin_hash, expires_at)
  VALUES (_family_id, _member_id, 'pin', extensions.crypt(_pin, extensions.gen_salt('bf')), _expires);

  RETURN QUERY SELECT _pin, _expires;
END;
$$;

REVOKE ALL ON FUNCTION public.create_pin_invite(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_pin_invite(UUID) TO authenticated;