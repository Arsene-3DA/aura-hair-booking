-- Corriger la contrainte de clé étrangère mal configurée
-- D'abord supprimer la mauvaise contrainte
ALTER TABLE hairdresser_services 
DROP CONSTRAINT IF EXISTS hairdresser_services_hairdresser_id_fkey;

-- Créer la bonne contrainte qui pointe vers la table hairdressers
ALTER TABLE hairdresser_services 
ADD CONSTRAINT hairdresser_services_hairdresser_id_fkey 
FOREIGN KEY (hairdresser_id) REFERENCES hairdressers(id) ON DELETE CASCADE;