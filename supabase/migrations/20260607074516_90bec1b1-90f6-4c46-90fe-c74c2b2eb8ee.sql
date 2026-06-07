CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _requested_role public.app_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' IN ('farmer', 'merchant', 'expert')
      THEN (NEW.raw_user_meta_data->>'role')::public.app_role
    ELSE 'farmer'::public.app_role
  END;
  _display_name text := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'display_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''),
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'User'
  );
  _phone text := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.raw_user_meta_data->>'phone', '')), '');
  _location text := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'state', NEW.raw_user_meta_data->>'location', '')), '');
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, phone, location)
  VALUES (NEW.id, _display_name, NEW.email, _phone, _location)
  ON CONFLICT (user_id) DO UPDATE
  SET
    display_name = COALESCE(NULLIF(trim(EXCLUDED.display_name), ''), public.profiles.display_name),
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    location = COALESCE(public.profiles.location, EXCLUDED.location),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.activity_log (user_id, action_type, action, metadata)
  VALUES (
    NEW.id,
    'auth_backend',
    'signup_profile_role_repair',
    jsonb_build_object(
      'profile_existed_or_created', true,
      'role', _requested_role,
      'email_domain', split_part(COALESCE(NEW.email, ''), '@', 2),
      'jwt_sub', NEW.id,
      'source', 'handle_new_user'
    )
  );

  RAISE LOG 'auth backend signup repair user_id=% profile=true role=% email_domain=%', NEW.id, _requested_role, split_part(COALESCE(NEW.email, ''), '@', 2);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.ensure_current_user_profile(
  _display_name text DEFAULT NULL::text,
  _phone text DEFAULT NULL::text,
  _location text DEFAULT NULL::text,
  _requested_role public.app_role DEFAULT 'farmer'::public.app_role
)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _email text := auth.jwt() ->> 'email';
  _jwt_role text := auth.jwt() ->> 'role';
  _jwt_aud text := auth.jwt() ->> 'aud';
  _safe_role public.app_role := CASE
    WHEN _requested_role IN ('farmer'::public.app_role, 'merchant'::public.app_role, 'expert'::public.app_role) THEN _requested_role
    ELSE 'farmer'::public.app_role
  END;
  _existing_role public.app_role;
  _profile_exists boolean;
  _role_exists boolean;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id) INTO _profile_exists;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) INTO _role_exists;

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

  INSERT INTO public.activity_log (user_id, action_type, action, metadata)
  VALUES (
    _user_id,
    'auth_backend',
    'login_profile_role_repair',
    jsonb_build_object(
      'profile_existed_before_repair', _profile_exists,
      'role_existed_before_repair', _role_exists,
      'resolved_role', _existing_role,
      'requested_role', _requested_role,
      'jwt_sub', _user_id,
      'jwt_role', _jwt_role,
      'jwt_aud', _jwt_aud,
      'email_domain', split_part(COALESCE(_email, ''), '@', 2),
      'source', 'ensure_current_user_profile'
    )
  );

  RAISE LOG 'auth backend login repair user_id=% profile_existed=% role_existed=% resolved_role=% jwt_role=% jwt_aud=% email_domain=%', _user_id, _profile_exists, _role_exists, _existing_role, _jwt_role, _jwt_aud, split_part(COALESCE(_email, ''), '@', 2);

  RETURN _existing_role;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.ensure_current_user_profile(text, text, text, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    RAISE EXCEPTION 'Required app_role type is missing';
  END IF;
END $$;