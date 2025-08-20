-- Réorganiser les professionnels selon les bonnes catégories

-- Mettre à jour le professionnel "gouvedissi" comme coiffeuse (genre female)
UPDATE public.hairdressers 
SET gender = 'female'
WHERE auth_id = 'c73dc3bd-1c2b-4ea1-99d7-1c2beeabdf58';

-- Mettre à jour le professionnel "sharepoint.arsene" comme coiffeur (genre male)  
UPDATE public.hairdressers 
SET gender = 'male'
WHERE auth_id = '92f3cf72-7b23-441d-8d55-229dfd2d7155';

-- Vérifier que les rôles sont cohérents dans la table profiles
UPDATE public.profiles 
SET role = 'coiffeuse'
WHERE user_id = 'c73dc3bd-1c2b-4ea1-99d7-1c2beeabdf58';

UPDATE public.profiles 
SET role = 'coiffeur'
WHERE user_id = '92f3cf72-7b23-441d-8d55-229dfd2d7155';