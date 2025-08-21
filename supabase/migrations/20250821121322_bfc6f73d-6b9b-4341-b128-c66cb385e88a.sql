-- Assurer l'accès public complet aux professionnels (syntaxe corrigée)
-- 1. Politique RLS pour accès public anonyme aux professionnels actifs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'hairdressers' 
        AND policyname = 'Anonymous users can view active professionals'
    ) THEN
        CREATE POLICY "Anonymous users can view active professionals" 
        ON public.hairdressers 
        FOR SELECT 
        TO anon
        USING (is_active = true);
    END IF;
END $$;

-- 2. Politique RLS pour accès public aux profils de professionnels
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Public can view professional profiles'
    ) THEN
        CREATE POLICY "Public can view professional profiles" 
        ON public.profiles 
        FOR SELECT 
        TO public
        USING (role IN ('coiffeur', 'coiffeuse', 'cosmetique'));
    END IF;
END $$;

-- 3. Assurer que la vue professionals_public est accessible publiquement
GRANT SELECT ON public.professionals_public TO anon;
GRANT SELECT ON public.professionals_public TO authenticated;