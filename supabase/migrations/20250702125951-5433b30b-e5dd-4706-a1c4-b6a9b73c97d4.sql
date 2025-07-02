
-- Créer une table pour les services
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration INTEGER, -- durée en minutes
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table de liaison entre coiffeurs et services
CREATE TABLE public.hairdresser_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hairdresser_id UUID REFERENCES public.hairdressers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hairdresser_id, service_id)
);

-- Activer RLS pour les services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hairdresser_services ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les services (lecture publique)
CREATE POLICY "Tout le monde peut voir les services" 
  ON public.services 
  FOR SELECT 
  USING (true);

CREATE POLICY "Tout le monde peut voir les services des coiffeurs" 
  ON public.hairdresser_services 
  FOR SELECT 
  USING (true);

-- Insérer les services de base
INSERT INTO public.services (name, description, price, duration, category) VALUES
('Coupe Homme', 'Coupe classique pour homme avec finitions', 25.00, 30, 'Coupe'),
('Coupe Femme', 'Coupe moderne pour femme avec styling', 35.00, 45, 'Coupe'),
('Barbe', 'Taille et mise en forme de la barbe', 15.00, 20, 'Barbe'),
('Rasage Traditionnel', 'Rasage complet au rasoir traditionnel', 20.00, 25, 'Barbe'),
('Coloration', 'Coloration complète des cheveux', 60.00, 90, 'Couleur'),
('Mèches', 'Mèches ou highlights', 50.00, 75, 'Couleur'),
('Balayage', 'Technique de coloration balayage', 70.00, 120, 'Couleur'),
('Permanente', 'Permanente pour volume et boucles', 45.00, 90, 'Traitement'),
('Lissage', 'Lissage professionnel', 80.00, 120, 'Traitement'),
('Soin Capillaire', 'Soin hydratant et réparateur', 30.00, 45, 'Soin'),
('Massage Cuir Chevelu', 'Massage relaxant du cuir chevelu', 20.00, 20, 'Soin'),
('Extensions', 'Pose d\'extensions capillaires', 120.00, 180, 'Coiffage'),
('Chignon', 'Réalisation de chignon pour événement', 40.00, 60, 'Coiffage'),
('Styling', 'Mise en forme et coiffage', 25.00, 30, 'Coiffage'),
('Dégradé', 'Coupe dégradée moderne', 30.00, 35, 'Coupe'),
('Barbe Sculptée', 'Taille artistique de la barbe', 25.00, 30, 'Barbe'),
('Coloration Fantaisie', 'Couleurs vives et créatives', 80.00, 150, 'Couleur'),
('Relooking', 'Conseil et transformation complète', 100.00, 180, 'Conseil');

-- Associer des services aléatoires aux coiffeurs existants
WITH hairdresser_list AS (
  SELECT id, name, gender FROM public.hairdressers
),
service_assignments AS (
  -- Antoine Dubois (homme)
  SELECT h.id as hairdresser_id, s.id as service_id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Antoine Dubois' 
  AND s.name IN ('Coupe Homme', 'Barbe', 'Rasage Traditionnel', 'Styling', 'Dégradé', 'Massage Cuir Chevelu', 'Soin Capillaire')
  
  UNION ALL
  
  -- Marc Rousseau (homme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Marc Rousseau'
  AND s.name IN ('Coupe Homme', 'Styling', 'Barbe', 'Dégradé', 'Soin Capillaire', 'Massage Cuir Chevelu')
  
  UNION ALL
  
  -- Thomas Moreau (homme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Thomas Moreau'
  AND s.name IN ('Coupe Homme', 'Dégradé', 'Soin Capillaire', 'Styling', 'Barbe', 'Massage Cuir Chevelu', 'Rasage Traditionnel', 'Coloration')
  
  UNION ALL
  
  -- Lucas Martin (homme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Lucas Martin'
  AND s.name IN ('Coupe Homme', 'Barbe Sculptée', 'Coloration', 'Styling', 'Dégradé', 'Soin Capillaire')
  
  UNION ALL
  
  -- Julien Bernard (homme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Julien Bernard'
  AND s.name IN ('Coupe Homme', 'Rasage Traditionnel', 'Massage Cuir Chevelu', 'Barbe', 'Styling', 'Soin Capillaire', 'Dégradé')
  
  UNION ALL
  
  -- Sophie Laurent (femme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Sophie Laurent'
  AND s.name IN ('Coupe Femme', 'Coloration', 'Mèches', 'Balayage', 'Soin Capillaire', 'Styling', 'Chignon', 'Extensions')
  
  UNION ALL
  
  -- Emma Dupont (femme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Emma Dupont'
  AND s.name IN ('Coupe Femme', 'Balayage', 'Lissage', 'Styling', 'Soin Capillaire', 'Coloration')
  
  UNION ALL
  
  -- Camille Petit (femme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Camille Petit'
  AND s.name IN ('Coupe Femme', 'Extensions', 'Chignon', 'Styling', 'Soin Capillaire', 'Coloration', 'Mèches', 'Balayage')
  
  UNION ALL
  
  -- Julie Moreau (femme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Julie Moreau'
  AND s.name IN ('Coupe Femme', 'Permanente', 'Soin Capillaire', 'Styling', 'Coloration', 'Massage Cuir Chevelu')
  
  UNION ALL
  
  -- Léa Rousseau (femme)
  SELECT h.id, s.id
  FROM hairdresser_list h, public.services s
  WHERE h.name = 'Léa Rousseau'
  AND s.name IN ('Coupe Femme', 'Coloration Fantaisie', 'Relooking', 'Styling', 'Balayage', 'Extensions', 'Chignon', 'Soin Capillaire')
)
INSERT INTO public.hairdresser_services (hairdresser_id, service_id)
SELECT hairdresser_id, service_id FROM service_assignments;
