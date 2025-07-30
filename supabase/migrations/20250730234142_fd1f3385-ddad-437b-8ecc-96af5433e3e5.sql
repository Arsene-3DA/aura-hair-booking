-- Créer une politique pour permettre la lecture publique des profils des professionnels
CREATE POLICY "Public can view professional profiles" 
ON public.profiles 
FOR SELECT 
USING (role IN ('coiffeur', 'coiffeuse', 'cosmetique'));

-- Créer également un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) 
WHERE role IN ('coiffeur', 'coiffeuse', 'cosmetique');