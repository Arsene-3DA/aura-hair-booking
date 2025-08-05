-- Vérifier les contraintes de clé étrangère sur hairdresser_services
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    a.attname AS column_name,
    af.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE conrelid = 'hairdresser_services'::regclass
AND contype = 'f';

-- Vérifier si la table hairdresser_services a une mauvaise référence vers profiles
\d hairdresser_services;