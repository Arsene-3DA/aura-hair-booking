-- Fonction pour promouvoir n'importe quel e-mail en admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur % introuvable', p_email;
  END IF;

  UPDATE public.profiles SET role = 'admin' WHERE user_id = v_uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable pour %', p_email;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO authenticated;

-- Policies pour l'administrateur - Voir et gérer TOUS les profils
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
CREATE POLICY "Admin full access"
  ON public.profiles
  FOR ALL
  USING (public.get_current_user_role() = 'admin');

-- Admin peut voir et gérer toutes les réservations
DROP POLICY IF EXISTS "Admin all on new_reservations" ON public.new_reservations;
CREATE POLICY "Admin all on new_reservations"
  ON public.new_reservations
  FOR ALL
  USING (public.get_current_user_role() = 'admin');

-- Admin peut voir et gérer tous les services
DROP POLICY IF EXISTS "Admin all on services" ON public.services;
CREATE POLICY "Admin all on services"
  ON public.services
  FOR ALL
  USING (public.get_current_user_role() = 'admin');

-- Admin peut voir et gérer tous les coiffeurs
DROP POLICY IF EXISTS "Admin all on hairdressers" ON public.hairdressers;
CREATE POLICY "Admin all on hairdressers"
  ON public.hairdressers
  FOR ALL
  USING (public.get_current_user_role() = 'admin');