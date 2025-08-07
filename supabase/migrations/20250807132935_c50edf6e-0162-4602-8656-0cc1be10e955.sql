-- Ajouter les nouveaux champs pour améliorer le profil des professionnels
ALTER TABLE public.hairdressers 
ADD COLUMN IF NOT EXISTS salon_address TEXT,
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{
  "monday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "tuesday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "wednesday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "thursday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "friday": {"open": "09:00", "close": "18:00", "isOpen": true},
  "saturday": {"open": "09:00", "close": "17:00", "isOpen": true},
  "sunday": {"open": "10:00", "close": "16:00", "isOpen": false}
}'::jsonb,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT;

-- Créer une table pour gérer les horaires de disponibilité en détail si nécessaire
CREATE TABLE IF NOT EXISTS public.stylist_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES public.hairdressers(auth_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Dimanche, 1 = Lundi, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(stylist_id, day_of_week)
);

-- Activer RLS sur la nouvelle table
ALTER TABLE public.stylist_schedule ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour stylist_schedule
CREATE POLICY "Stylists can manage their own schedule" ON public.stylist_schedule
FOR ALL USING (stylist_id = auth.uid())
WITH CHECK (stylist_id = auth.uid());

CREATE POLICY "Public can view stylist schedules" ON public.stylist_schedule
FOR SELECT USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_stylist_schedule_updated_at
  BEFORE UPDATE ON public.stylist_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Améliorer la table portfolio pour supporter plus d'images
ALTER TABLE public.portfolio 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_stylist_schedule_stylist_day ON public.stylist_schedule(stylist_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_portfolio_stylist_featured ON public.portfolio(stylist_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_display_order ON public.portfolio(stylist_id, display_order);

-- Fonction pour synchroniser les horaires avec les créneaux de réservation
CREATE OR REPLACE FUNCTION public.sync_stylist_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Cette fonction sera appelée quand les horaires changent
  -- Pour l'instant, elle ne fait rien mais peut être étendue pour gérer
  -- la synchronisation automatique avec les créneaux disponibles
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour synchroniser les disponibilités
CREATE TRIGGER sync_availability_on_schedule_change
  AFTER INSERT OR UPDATE OR DELETE ON public.stylist_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_stylist_availability();