
-- Insérer 10 coiffeurs et coiffeuses avec des données complètes
INSERT INTO public.hairdressers (name, email, phone, specialties, experience, location, gender, rating, is_active, image_url) VALUES

-- Coiffeurs hommes (5)
('Antoine Dubois', 'antoine.dubois@salon.fr', '06 12 34 56 78', ARRAY['Coupe homme', 'Barbe', 'Rasage traditionnel'], '8 ans d''expérience', 'Paris 15ème', 'male', 4.8, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'),

('Marc Rousseau', 'marc.rousseau@salon.fr', '06 23 45 67 89', ARRAY['Coupe moderne', 'Styling', 'Barbe'], '6 ans d''expérience', 'Paris 15ème', 'male', 4.7, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'),

('Thomas Moreau', 'thomas.moreau@salon.fr', '06 34 56 78 90', ARRAY['Coupe classique', 'Dégradé', 'Soin'], '10 ans d''expérience', 'Paris 15ème', 'male', 4.9, true, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face'),

('Lucas Martin', 'lucas.martin@salon.fr', '06 45 67 89 01', ARRAY['Coupe tendance', 'Barbe sculptée', 'Coloration'], '5 ans d''expérience', 'Paris 15ème', 'male', 4.6, true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face'),

('Julien Bernard', 'julien.bernard@salon.fr', '06 56 78 90 12', ARRAY['Coupe homme', 'Rasage', 'Massage cuir chevelu'], '7 ans d''expérience', 'Paris 15ème', 'male', 4.8, true, 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop&crop=face'),

-- Coiffeuses femmes (5)
('Sophie Laurent', 'sophie.laurent@salon.fr', '06 67 89 01 23', ARRAY['Coupe femme', 'Coloration', 'Mèches'], '9 ans d''expérience', 'Paris 15ème', 'female', 4.9, true, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'),

('Emma Dupont', 'emma.dupont@salon.fr', '06 78 90 12 34', ARRAY['Coupe moderne', 'Balayage', 'Lissage'], '6 ans d''expérience', 'Paris 15ème', 'female', 4.7, true, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face'),

('Camille Petit', 'camille.petit@salon.fr', '06 89 01 23 45', ARRAY['Coupe tendance', 'Extensions', 'Chignon'], '8 ans d''expérience', 'Paris 15ème', 'female', 4.8, true, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face'),

('Julie Moreau', 'julie.moreau@salon.fr', '06 90 12 34 56', ARRAY['Coupe femme', 'Permanente', 'Soin capillaire'], '7 ans d''expérience', 'Paris 15ème', 'female', 4.6, true, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=300&fit=crop&crop=face'),

('Léa Rousseau', 'lea.rousseau@salon.fr', '06 01 23 45 67', ARRAY['Coupe créative', 'Coloration fantaisie', 'Relooking'], '5 ans d''expérience', 'Paris 15ème', 'female', 4.9, true, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=face');
