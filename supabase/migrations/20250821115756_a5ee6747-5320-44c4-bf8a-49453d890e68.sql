-- Corriger les contraintes manquantes et les politiques RLS pour l'inscription

-- 1. Ajouter les contraintes uniques manquantes
ALTER TABLE public.users 
  ADD CONSTRAINT users_email_unique UNIQUE (email),
  ADD CONSTRAINT users_auth_id_unique UNIQUE (auth_id);

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 2. Corriger les politiques RLS pour permettre l'inscription normale
-- Supprimer la politique restrictive actuelle
DROP POLICY IF EXISTS "Les admins peuvent créer des utilisateurs" ON public.users;

-- Ajouter une politique permettant la création automatique via triggers
CREATE POLICY "Allow user creation via triggers" 
ON public.users 
FOR INSERT 
WITH CHECK (true); -- Permet les insertions via les triggers système

-- 3. Corriger la fonction handle_new_user_enhanced pour éviter les conflits
CREATE OR REPLACE FUNCTION public.handle_new_user_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validation des données d'entrée
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email requis pour créer un profil utilisateur';
  END IF;

  -- Créer l'entrée dans la table users avec ON CONFLICT qui fonctionne maintenant
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

  -- Créer l'entrée dans la table profiles avec ON CONFLICT qui fonctionne maintenant
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
$function$;