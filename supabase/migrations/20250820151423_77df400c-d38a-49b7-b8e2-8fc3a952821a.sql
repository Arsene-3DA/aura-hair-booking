-- Mettre à jour les photos de profil des professionnels existants
UPDATE hairdressers 
SET image_url = '/src/assets/sharepoint-arsene-profile.jpg', updated_at = NOW()
WHERE name = 'sharepoint.arsene';

UPDATE hairdressers 
SET image_url = '/src/assets/gouvedissi-profile.jpg', updated_at = NOW()
WHERE name = 'gouvedissi';

-- S'assurer que les deux professionnels sont actifs
UPDATE hairdressers 
SET is_active = true, updated_at = NOW()
WHERE name IN ('sharepoint.arsene', 'gouvedissi');