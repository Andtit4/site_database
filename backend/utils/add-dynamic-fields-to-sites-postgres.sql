-- Script de migration PostgreSQL pour ajouter les champs dynamiques aux sites

-- Créer le type ENUM pour les types de sites s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'site_type_enum') THEN
        CREATE TYPE site_type_enum AS ENUM (
            'TOUR', 
            'SHELTER', 
            'PYLONE', 
            'BATIMENT', 
            'TOIT_BATIMENT', 
            'ROOFTOP', 
            'TERRAIN_BAILLE', 
            'TERRAIN_PROPRIETAIRE', 
            'AUTRE'
        );
    END IF;
END
$$;

-- Ajouter la colonne type à la table site si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site' AND column_name = 'type'
    ) THEN
        ALTER TABLE site ADD COLUMN type site_type_enum DEFAULT NULL;
    END IF;
END
$$;

-- Ajouter la colonne dynamicFieldsDefinition pour stocker les définitions de champs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site' AND column_name = 'dynamicFieldsDefinition'
    ) THEN
        ALTER TABLE site ADD COLUMN "dynamicFieldsDefinition" JSONB DEFAULT NULL;
    END IF;
END
$$;

-- Ajouter la colonne departmentId si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site' AND column_name = 'departmentId'
    ) THEN
        ALTER TABLE site ADD COLUMN "departmentId" VARCHAR(36) DEFAULT NULL;
    END IF;
END
$$;

-- Mettre à jour la colonne specifications si elle n'existe pas (elle devrait déjà exister)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site' AND column_name = 'specifications'
    ) THEN
        ALTER TABLE site ADD COLUMN specifications JSONB DEFAULT NULL;
    END IF;
END
$$;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_site_type ON site(type);
CREATE INDEX IF NOT EXISTS idx_site_department ON site("departmentId");

-- Optionnel: Mettre à jour les sites existants avec des types par défaut basés sur leurs noms
-- UPDATE site SET type = 'TOUR' WHERE type IS NULL AND (name ILIKE '%TOUR%' OR name ILIKE '%tour%');
-- UPDATE site SET type = 'SHELTER' WHERE type IS NULL AND (name ILIKE '%SHELTER%' OR name ILIKE '%shelter%');
-- UPDATE site SET type = 'PYLONE' WHERE type IS NULL AND (name ILIKE '%PYLONE%' OR name ILIKE '%pylone%');
-- UPDATE site SET type = 'BATIMENT' WHERE type IS NULL AND (name ILIKE '%BATIMENT%' OR name ILIKE '%batiment%');

-- Vérifier la structure de la table après modifications
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'site' 
ORDER BY ordinal_position; 
