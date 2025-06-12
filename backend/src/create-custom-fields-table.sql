-- Script pour créer la table site_custom_fields pour PostgreSQL

-- Créer l'enum pour les types de champs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'custom_field_type_enum') THEN
        CREATE TYPE custom_field_type_enum AS ENUM (
            'string',
            'number',
            'boolean',
            'date',
            'select',
            'textarea'
        );
    END IF;
END $$;

-- Créer la table site_custom_fields
CREATE TABLE IF NOT EXISTS site_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fieldName" VARCHAR NOT NULL UNIQUE,
    "fieldLabel" VARCHAR NOT NULL,
    "fieldType" custom_field_type_enum NOT NULL,
    required BOOLEAN DEFAULT false,
    "defaultValue" VARCHAR NULL,
    options JSONB NULL,
    validation JSONB NULL,
    description TEXT NULL,
    active BOOLEAN DEFAULT true,
    "sortOrder" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter la colonne customFieldsValues à la table sites
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site' 
        AND column_name = 'customFieldsValues'
    ) THEN
        ALTER TABLE site ADD COLUMN "customFieldsValues" JSONB NULL;
    END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_site_custom_fields_active ON site_custom_fields (active);
CREATE INDEX IF NOT EXISTS idx_site_custom_fields_sort_order ON site_custom_fields ("sortOrder");
CREATE INDEX IF NOT EXISTS idx_site_custom_fields_field_name ON site_custom_fields ("fieldName");

-- Index sur customFieldsValues pour PostgreSQL JSONB
CREATE INDEX IF NOT EXISTS idx_site_custom_fields_values ON site ("customFieldsValues") USING GIN;

-- Fonction pour mettre à jour la colonne updatedAt automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la table site_custom_fields
DROP TRIGGER IF EXISTS update_site_custom_fields_updated_at ON site_custom_fields;
CREATE TRIGGER update_site_custom_fields_updated_at
    BEFORE UPDATE ON site_custom_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT; 
