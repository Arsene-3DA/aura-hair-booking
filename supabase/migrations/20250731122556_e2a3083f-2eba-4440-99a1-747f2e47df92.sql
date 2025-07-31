/* ───────────────────────────────
   1. Colonnes supplémentaires
   ─────────────────────────────── */
ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS message_type TEXT  DEFAULT 'text'
        CHECK (message_type IN ('text','system','booking')),
    ADD COLUMN IF NOT EXISTS booking_id UUID
        REFERENCES public.bookings(id) ON DELETE CASCADE;

/* ───────────────────────────────
   2. Index pour la perf
   ─────────────────────────────── */
CREATE INDEX IF NOT EXISTS idx_messages_is_read     ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id  ON public.messages(booking_id);

/* ───────────────────────────────
   3. Fonctions utilitaires
   ─────────────────────────────── */
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_stylist_id UUID,
  p_client_id  UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.messages
     SET is_read = true
   WHERE sender_id = p_stylist_id
     AND receiver_id = p_client_id
     AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.count_unread_messages(
  p_stylist_id UUID,
  p_client_id  UUID,
  p_user_type  TEXT DEFAULT 'client'  -- 'client' | 'stylist'
)
RETURNS INTEGER AS $$
BEGIN
  IF p_user_type = 'client' THEN
    RETURN (
      SELECT COUNT(*) FROM public.messages
       WHERE sender_id = p_stylist_id
         AND receiver_id = p_client_id
         AND is_read = false
    );
  ELSE
    RETURN (
      SELECT COUNT(*) FROM public.messages
       WHERE sender_id = p_client_id
         AND receiver_id = p_stylist_id
         AND is_read = false
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* ───────────────────────────────
   4. RLS : visibilité & écriture
   ─────────────────────────────── */
DROP POLICY IF EXISTS "messages_rls" ON public.messages;
DROP POLICY IF EXISTS "chat_participants" ON public.messages;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_rls" ON public.messages
  USING (
      (sender_id = auth.uid())     -- sender can see their messages
   OR (receiver_id = auth.uid())   -- receiver can see their messages
  )
  WITH CHECK (
      (sender_id = auth.uid())     -- only sender can create messages as themselves
  );

/* ───────────────────────────────
   5. Droits
   ─────────────────────────────── */
GRANT EXECUTE ON FUNCTION public.mark_messages_as_read    TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_unread_messages    TO authenticated;