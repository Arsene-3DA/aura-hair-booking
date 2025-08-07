-- Mise à jour pour attribuer 5 étoiles par défaut aux nouveaux professionnels
-- et assurer la synchronisation temps réel des données de contact

-- 1. Modifier la valeur par défaut pour rating dans hairdressers
ALTER TABLE public.hairdressers 
ALTER COLUMN rating SET DEFAULT 5.0;

-- 2. Mettre à jour les professionnels existants qui ont rating = 0 vers 5.0
-- (seulement ceux qui n'ont pas encore d'avis)
UPDATE public.hairdressers 
SET rating = 5.0 
WHERE rating = 0.0 AND auth_id NOT IN (
  SELECT DISTINCT stylist_id 
  FROM public.reviews 
  WHERE stylist_id IS NOT NULL AND is_approved = true
);

-- 3. Créer un trigger pour mettre à jour la note seulement quand il y a des avis approuvés
CREATE OR REPLACE FUNCTION public.update_hairdresser_rating_with_default()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  avg_rating numeric;
  review_count integer;
BEGIN
  -- Compter le nombre d'avis approuvés pour ce styliste
  SELECT COUNT(*), COALESCE(AVG(rating::numeric), 5.0) 
  INTO review_count, avg_rating
  FROM public.reviews 
  WHERE stylist_id = COALESCE(NEW.stylist_id, OLD.stylist_id) 
  AND is_approved = true;
  
  -- Si aucun avis approuvé, garder la note par défaut de 5.0
  -- Sinon, utiliser la moyenne des avis
  IF review_count = 0 THEN
    avg_rating := 5.0;
  END IF;
  
  -- Mettre à jour la note dans la table hairdressers
  UPDATE public.hairdressers 
  SET rating = avg_rating,
      updated_at = now()
  WHERE auth_id = COALESCE(NEW.stylist_id, OLD.stylist_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Remplacer l'ancien trigger par le nouveau
DROP TRIGGER IF EXISTS update_hairdresser_rating_trigger ON public.reviews;
CREATE TRIGGER update_hairdresser_rating_with_default_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_hairdresser_rating_with_default();

-- 4. Ajouter des contraintes de validation pour les champs de contact
-- Créer une fonction de validation pour l'email
CREATE OR REPLACE FUNCTION public.validate_hairdresser_contact_info()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Validation de l'email si fourni
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Format d''email invalide';
    END IF;
    NEW.email = lower(trim(NEW.email));
  END IF;
  
  -- Validation du téléphone si fourni (format français ou international)
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    -- Nettoyer le téléphone (supprimer espaces, tirets, points)
    NEW.phone = regexp_replace(NEW.phone, '[^0-9+]', '', 'g');
    
    -- Vérifier le format (au moins 10 chiffres)
    IF length(regexp_replace(NEW.phone, '[^0-9]', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'Le numéro de téléphone doit contenir au moins 10 chiffres';
    END IF;
  END IF;
  
  -- Validation de l'adresse (ne peut pas être vide si fournie)
  IF NEW.salon_address IS NOT NULL THEN
    NEW.salon_address = trim(NEW.salon_address);
    IF NEW.salon_address = '' THEN
      NEW.salon_address = NULL;
    END IF;
  END IF;
  
  -- Validation du nom (obligatoire)
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'Le nom est obligatoire';
  END IF;
  NEW.name = trim(NEW.name);
  
  RETURN NEW;
END;
$$;

-- Créer le trigger de validation
DROP TRIGGER IF EXISTS validate_hairdresser_contact_trigger ON public.hairdressers;
CREATE TRIGGER validate_hairdresser_contact_trigger
  BEFORE INSERT OR UPDATE ON public.hairdressers
  FOR EACH ROW EXECUTE FUNCTION public.validate_hairdresser_contact_info();

-- 5. Activer la réplication temps réel pour la table hairdressers
ALTER TABLE public.hairdressers REPLICA IDENTITY FULL;