/* ───────────────────────────────
   Remplacement sécurisé des fonctions
   ─────────────────────────────── */

/* 1. Supprimer les anciennes définitions (si elles existent) */
DROP FUNCTION IF EXISTS public.mark_messages_as_read(uuid, uuid);
DROP FUNCTION IF EXISTS public.count_unread_messages(uuid, uuid, text);

/* 2. Recréer en fixant le search_path = public */
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_stylist_id UUID,
  p_client_id  UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER               -- s'exécute avec les droits du créateur
SET search_path = public       -- évite l'escalade hors du schéma
AS $$
BEGIN
  UPDATE public.messages
     SET is_read = true
   WHERE sender_id   = p_stylist_id
     AND receiver_id = p_client_id
     AND is_read     = false;
END;
$$;

CREATE OR REPLACE FUNCTION public.count_unread_messages(
  p_stylist_id UUID,
  p_client_id  UUID,
  p_user_type  TEXT DEFAULT 'client'   -- 'client' | 'stylist'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_type = 'client' THEN
    RETURN (
      SELECT COUNT(*) FROM public.messages
       WHERE sender_id   = p_stylist_id
         AND receiver_id = p_client_id
         AND is_read     = false
    );
  ELSE
    RETURN (
      SELECT COUNT(*) FROM public.messages
       WHERE sender_id   = p_client_id
         AND receiver_id = p_stylist_id
         AND is_read     = false
    );
  END IF;
END;
$$;

/* 3. Accorder le droit d'exécution au rôle authenticator */
GRANT EXECUTE ON FUNCTION public.mark_messages_as_read      TO authenticator;
GRANT EXECUTE ON FUNCTION public.count_unread_messages      TO authenticator;