-- Finaliser la politique RLS de new_reservations et créer les index

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.new_reservations ENABLE ROW LEVEL SECURITY;

-- Supprimer l'ancienne policy si elle existe
DROP POLICY IF EXISTS new_reservations_rls ON public.new_reservations;

-- Créer une policy lecture/écriture : client OU stylist concerné
CREATE POLICY new_reservations_rls
  ON public.new_reservations
  FOR ALL
  USING  (client_user_id  = auth.uid() OR stylist_user_id = auth.uid())
  WITH CHECK (client_user_id = auth.uid() OR stylist_user_id = auth.uid());

-- Index utiles pour les performances
CREATE INDEX IF NOT EXISTS idx_new_reservations_stylist
  ON public.new_reservations(stylist_user_id);

CREATE INDEX IF NOT EXISTS idx_new_reservations_client
  ON public.new_reservations(client_user_id);

CREATE INDEX IF NOT EXISTS idx_new_reservations_status
  ON public.new_reservations(status);