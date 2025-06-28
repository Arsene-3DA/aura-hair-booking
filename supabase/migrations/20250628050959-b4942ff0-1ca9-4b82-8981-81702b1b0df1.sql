
-- Créer des utilisateurs clients de test avec des mots de passe hashés
INSERT INTO public.users (email, password_hash, user_type, first_name, last_name, phone, is_active) VALUES
('marie.dubois@client.fr', encode(digest('client123' || 'salon_salt', 'sha256'), 'hex'), 'client', 'Marie', 'Dubois', '06 12 34 56 78', true),
('pierre.martin@client.fr', encode(digest('client123' || 'salon_salt', 'sha256'), 'hex'), 'client', 'Pierre', 'Martin', '06 23 45 67 89', true),
('sophie.lefebvre@client.fr', encode(digest('client123' || 'salon_salt', 'sha256'), 'hex'), 'client', 'Sophie', 'Lefebvre', '06 34 56 78 90', true),
('thomas.durand@client.fr', encode(digest('client123' || 'salon_salt', 'sha256'), 'hex'), 'client', 'Thomas', 'Durand', '06 45 67 89 01', true),
('julie.moreau@client.fr', encode(digest('client123' || 'salon_salt', 'sha256'), 'hex'), 'client', 'Julie', 'Moreau', '06 56 78 90 12', true);

-- Créer des utilisateurs coiffeurs de test
INSERT INTO public.users (email, password_hash, user_type, first_name, last_name, phone, is_active) VALUES
('marie.dupont@coiffeur.fr', encode(digest('coiffeur123' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Marie', 'Dupont', '06 11 22 33 44', true),
('jean.martin@coiffeur.fr', encode(digest('coiffeur123' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Jean', 'Martin', '06 22 33 44 55', true),
('sophie.bernard@coiffeur.fr', encode(digest('coiffeur123' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Sophie', 'Bernard', '06 33 44 55 66', true);

-- Créer les profils coiffeurs associés (en utilisant les IDs des coiffeurs existants dans la table hairdressers)
-- Note: Cette partie nécessite que vous ayez déjà des enregistrements dans la table hairdressers
-- Si vous n'en avez pas, nous devrons d'abord en créer

-- Nettoyer les sessions expirées
DELETE FROM public.user_sessions WHERE expires_at < NOW();
