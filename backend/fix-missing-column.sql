-- Script pour ajouter la colonne isDepartmentAdmin manquante
-- À exécuter dans pgAdmin ou directement via psql

-- Vérifier si la colonne existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='isDepartmentAdmin'
    ) THEN
        -- Ajouter la colonne si elle n'existe pas
        ALTER TABLE "users" ADD COLUMN "isDepartmentAdmin" boolean NOT NULL DEFAULT false;
        RAISE NOTICE 'Colonne isDepartmentAdmin ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne isDepartmentAdmin déjà présente';
    END IF;
END
$$; 
