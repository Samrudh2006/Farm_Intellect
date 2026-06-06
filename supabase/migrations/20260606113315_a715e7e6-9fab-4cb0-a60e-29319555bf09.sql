CREATE OR REPLACE FUNCTION public.ensure_current_user_profile(
  _display_name text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _location text DEFAULT NULL,
  _requested_role public.app_role DEFAULT 'farmer'::public.app_role
)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _email text := auth.jwt() ->> 'email';
  _safe_role public.app_role := CASE
    WHEN _requested_role IN ('farmer'::public.app_role, 'merchant'::public.app_role, 'expert'::public.app_role) THEN _requested_role
    ELSE 'farmer'::public.app_role
  END;
  _existing_role public.app_role;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.profiles (user_id, display_name, email, phone, location)
  VALUES (
    _user_id,
    COALESCE(NULLIF(trim(_display_name), ''), split_part(COALESCE(_email, ''), '@', 1), 'User'),
    _email,
    NULLIF(trim(COALESCE(_phone, '')), ''),
    NULLIF(trim(COALESCE(_location, '')), '')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    display_name = COALESCE(NULLIF(trim(_display_name), ''), public.profiles.display_name),
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    location = COALESCE(public.profiles.location, EXCLUDED.location),
    updated_at = now();

  SELECT role INTO _existing_role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin'::public.app_role THEN 1
    WHEN 'expert'::public.app_role THEN 2
    WHEN 'merchant'::public.app_role THEN 3
    ELSE 4
  END
  LIMIT 1;

  IF _existing_role IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _safe_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    _existing_role := _safe_role;
  END IF;

  RETURN _existing_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_current_user_profile(text, text, text, public.app_role) TO authenticated;

INSERT INTO public.profiles (user_id, display_name, email)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'name', split_part(COALESCE(au.email, ''), '@', 1), 'User'),
  au.email
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = au.id
);

INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'farmer'::public.app_role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
);