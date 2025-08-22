-- Fonction pour permettre aux professionnels de gérer leurs disponibilités
CREATE OR REPLACE FUNCTION public.set_professional_availability(
  start_datetime timestamp with time zone,
  end_datetime timestamp with time zone,
  availability_status text DEFAULT 'available'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Vérifier que l'utilisateur est un professionnel
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('coiffeur', 'coiffeuse', 'cosmetique')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Accès refusé');
  END IF;
  
  -- Valider le statut
  IF availability_status NOT IN ('available', 'unavailable', 'busy') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Statut invalide');
  END IF;
  
  -- Supprimer les disponibilités existantes dans cette plage horaire
  DELETE FROM public.availabilities 
  WHERE stylist_id = auth.uid()
    AND start_at >= start_datetime 
    AND end_at <= end_datetime;
  
  -- Insérer la nouvelle disponibilité
  INSERT INTO public.availabilities (
    stylist_id, 
    start_at, 
    end_at, 
    status
  ) VALUES (
    auth.uid(),
    start_datetime,
    end_datetime,
    availability_status::availability_status
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Disponibilité mise à jour avec succès'
  );
END;
$$;

-- Fonction pour obtenir les disponibilités d'un professionnel (pour son dashboard)
CREATE OR REPLACE FUNCTION public.get_professional_availabilities(
  start_date date DEFAULT CURRENT_DATE,
  end_date date DEFAULT CURRENT_DATE + interval '7 days'
)
RETURNS TABLE(
  id uuid,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  status text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vérifier que l'utilisateur est un professionnel
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('coiffeur', 'coiffeuse', 'cosmetique')
  ) THEN
    RAISE EXCEPTION 'Accès refusé: professionnel requis';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id,
    a.start_at,
    a.end_at,
    a.status::text,
    a.created_at
  FROM public.availabilities a
  WHERE a.stylist_id = auth.uid()
    AND a.start_at::date BETWEEN start_date AND end_date
  ORDER BY a.start_at;
END;
$$;