-- Mettre à jour le rôle de l'utilisateur actuel pour qu'il puisse créer des services
UPDATE profiles 
SET role = 'coiffeur'::user_role 
WHERE user_id = '92f3cf72-7b23-441d-8d55-229dfd2d7155';

-- Vérifier que l'utilisateur a maintenant le bon rôle
SELECT user_id, role, full_name FROM profiles WHERE user_id = '92f3cf72-7b23-441d-8d55-229dfd2d7155';