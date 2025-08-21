-- 1. Créer une fonction sécurisée pour obtenir tous les utilisateurs (admin uniquement)
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE(
  id uuid,
  auth_id uuid,
  email text,
  nom text,
  prenom text,
  role user_role,
  status user_status,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  telephone text,
  full_name text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent voir tous les utilisateurs';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.auth_id,
    u.email,
    u.nom,
    u.prenom,
    u.role,
    u.status,
    u.created_at,
    u.updated_at,
    u.telephone,
    p.full_name,
    p.avatar_url
  FROM public.users u
  LEFT JOIN public.profiles p ON u.auth_id = p.user_id
  WHERE u.email IS NOT NULL 
    AND u.email != ''
    AND NOT COALESCE(u.is_test, false) -- Exclure les comptes de test
  ORDER BY u.created_at DESC;
END;
$$;

-- 2. Améliorer le trigger de création automatique de profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validation des données d'entrée
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email requis pour créer un profil utilisateur';
  END IF;

  -- Créer l'entrée dans la table users
  INSERT INTO public.users (auth_id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'client')
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();

  -- Créer l'entrée dans la table profiles
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      TRIM(COALESCE(NEW.raw_user_meta_data ->> 'nom', '') || ' ' || COALESCE(NEW.raw_user_meta_data ->> 'prenom', '')),
      NEW.email
    ),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'client')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 3. Remplacer le trigger existant
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_enhanced ON auth.users;

CREATE TRIGGER on_auth_user_created_enhanced
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_enhanced();

-- 4. Ajouter une colonne is_test pour marquer les comptes de test
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

-- 5. Marquer les comptes de test existants
UPDATE public.users 
SET is_test = true 
WHERE email ILIKE '%@salon.com%' 
   OR email ILIKE '%demo%' 
   OR email ILIKE '%test%'
   OR nom ILIKE '%système%';

UPDATE public.profiles 
SET is_test = true 
WHERE user_id IN (
  SELECT auth_id FROM public.users WHERE is_test = true
);

-- 6. Fonction pour obtenir les créneaux disponibles avec bon fuseau horaire
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  professional_id uuid,
  target_date date DEFAULT CURRENT_DATE,
  timezone_name text DEFAULT 'UTC'
)
RETURNS TABLE(
  time_slot time,
  is_available boolean,
  slot_datetime timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_timezone text := COALESCE(timezone_name, 'UTC');
BEGIN
  RETURN QUERY
  WITH time_slots AS (
    -- Générer les créneaux de 30 minutes de 9h à 18h
    SELECT 
      slot_time::time as time_slot,
      (target_date + slot_time::time) AT TIME ZONE target_timezone as slot_datetime
    FROM generate_series(
      '09:00'::time,
      '17:30'::time,
      '30 minutes'::interval
    ) as slot_time
  ),
  booked_slots AS (
    -- Récupérer les créneaux déjà réservés
    SELECT 
      DATE_TRUNC('minute', scheduled_at AT TIME ZONE target_timezone)::time as booked_time
    FROM public.new_reservations nr
    WHERE nr.stylist_user_id = professional_id
      AND DATE(nr.scheduled_at AT TIME ZONE target_timezone) = target_date
      AND nr.status IN ('confirmed', 'pending')
  )
  SELECT 
    ts.time_slot,
    NOT EXISTS (
      SELECT 1 FROM booked_slots bs 
      WHERE bs.booked_time = ts.time_slot
    ) as is_available,
    ts.slot_datetime
  FROM time_slots ts
  WHERE ts.slot_datetime > NOW() -- Seulement les créneaux futurs
  ORDER BY ts.time_slot;
END;
$$;