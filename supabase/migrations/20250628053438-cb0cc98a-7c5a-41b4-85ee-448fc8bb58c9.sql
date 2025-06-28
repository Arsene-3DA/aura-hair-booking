
-- Vérifier la contrainte actuelle sur le champ gender
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.hairdressers'::regclass 
AND contype = 'c';

-- Supprimer les anciens comptes de test et créer les nouveaux comptes spécifiés
DELETE FROM public.user_sessions;
DELETE FROM public.coiffeur_profiles;
DELETE FROM public.users WHERE user_type IN ('admin', 'coiffeur');
DELETE FROM public.hairdressers;

-- Créer le compte administrateur
INSERT INTO public.users (email, password_hash, user_type, first_name, last_name, is_active) VALUES
('admin.salon@salon.fr', encode(digest('admin2024' || 'salon_salt', 'sha256'), 'hex'), 'admin', 'Admin', 'Salon', true);

-- Créer les profils coiffeurs dans la table hairdressers (avec gender corrigé)
INSERT INTO public.hairdressers (id, name, email, phone, specialties, experience, location, gender, rating, is_active, image_url) VALUES
(gen_random_uuid(), 'Anna Martin', 'anna.martin@salon.fr', '06 11 22 33 01', ARRAY['Coupe', 'Coloration', 'Brushing'], '5 ans d''expérience', 'Paris 15ème', 'female', 4.8, true, 'https://images.unsplash.com/photo-1594824388853-2c5899d23c3c?w=300&h=300&fit=crop&crop=face'),
(gen_random_uuid(), 'Julie Dubois', 'julie.dubois@salon.fr', '06 11 22 33 02', ARRAY['Coupe', 'Permanente', 'Soin'], '7 ans d''expérience', 'Paris 15ème', 'female', 4.9, true, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=300&fit=crop&crop=face'),
(gen_random_uuid(), 'Marc Rousseau', 'marc.rousseau@salon.fr', '06 11 22 33 03', ARRAY['Coupe homme', 'Barbe', 'Rasage'], '10 ans d''expérience', 'Paris 15ème', 'male', 4.7, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'),
(gen_random_uuid(), 'Sophie Laurent', 'sophie.laurent@salon.fr', '06 11 22 33 04', ARRAY['Coupe', 'Mèches', 'Balayage'], '6 ans d''expérience', 'Paris 15ème', 'female', 4.6, true, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'),
(gen_random_uuid(), 'Thomas Moreau', 'thomas.moreau@salon.fr', '06 11 22 33 05', ARRAY['Coupe', 'Coloration', 'Défrisage'], '8 ans d''expérience', 'Paris 15ème', 'male', 4.8, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'),
(gen_random_uuid(), 'Camille Petit', 'camille.petit@salon.fr', '06 11 22 33 06', ARRAY['Coupe', 'Extensions', 'Chignon'], '4 ans d''expérience', 'Paris 15ème', 'female', 4.5, true, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face');

-- Créer les comptes utilisateurs pour les coiffeurs
INSERT INTO public.users (email, password_hash, user_type, first_name, last_name, phone, is_active) VALUES
('anna.martin@salon.fr', encode(digest('anna123' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Anna', 'Martin', '06 11 22 33 01', true),
('julie.dubois@salon.fr', encode(digest('julie456' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Julie', 'Dubois', '06 11 22 33 02', true),
('marc.rousseau@salon.fr', encode(digest('marc789' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Marc', 'Rousseau', '06 11 22 33 03', true),
('sophie.laurent@salon.fr', encode(digest('sophie321' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Sophie', 'Laurent', '06 11 22 33 04', true),
('thomas.moreau@salon.fr', encode(digest('thomas654' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Thomas', 'Moreau', '06 11 22 33 05', true),
('camille.petit@salon.fr', encode(digest('camille987' || 'salon_salt', 'sha256'), 'hex'), 'coiffeur', 'Camille', 'Petit', '06 11 22 33 06', true);

-- Créer les liens entre les utilisateurs coiffeurs et leurs profils
INSERT INTO public.coiffeur_profiles (user_id, hairdresser_id)
SELECT u.id, h.id
FROM public.users u
JOIN public.hairdressers h ON u.email = h.email
WHERE u.user_type = 'coiffeur';
