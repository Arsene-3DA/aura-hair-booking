-- 1. Vérifier (ou créer) les colonnes indispensables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
          AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- 2. Fonction déclencheur robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_full_name text;
BEGIN
  /* ---------------- Déterminer le nom à enregistrer ---------------- */
  v_full_name :=
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    );

  /* ---------------- Insérer ou mettre à jour le profil -------------- */
  INSERT INTO public.profiles (user_id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.raw_user_meta_data ->> 'picture',
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.user_role,
      'client'
    )
  )
  ON CONFLICT (user_id) DO
    UPDATE
    SET full_name   = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url  = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at  = now();

  RETURN NEW;

EXCEPTION WHEN others THEN
  RAISE WARNING 'handle_new_user : % (%). NEW.id=%',
                SQLERRM, SQLSTATE, NEW.id;
  RETURN NEW;
END;
$func$;

-- 3. (Re)créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 4. Droits d'exécution pour le rôle authenticator
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticator;