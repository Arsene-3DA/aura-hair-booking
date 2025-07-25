-- Ajouter la nouvelle valeur enum en deux étapes
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'no_show';