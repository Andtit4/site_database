-- Vérifier et ajouter la colonne isTeamMember à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS isTeamMember BOOLEAN DEFAULT false NOT NULL;

-- Vérifier et ajouter la colonne isDeleted à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS isDeleted BOOLEAN DEFAULT false NOT NULL;

-- Vérifier et ajouter la colonne teamId à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS teamId VARCHAR(36) NULL;

-- Vérifier et ajouter la colonne hasDepartmentRights à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS hasDepartmentRights BOOLEAN DEFAULT false NOT NULL;

-- Vérifier et ajouter la colonne managedEquipmentTypes à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS managedEquipmentTypes JSON NULL;

-- Vérifier et ajouter la colonne isDeleted à la table teams (si elle existe)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS isDeleted BOOLEAN DEFAULT false NOT NULL;

-- Vérifier et ajouter la colonne isDeleted à la table departments (si elle existe)
ALTER TABLE departments ADD COLUMN IF NOT EXISTS isDeleted BOOLEAN DEFAULT false NOT NULL;

-- Vérifier et ajouter la colonne isDeleted à la table equipment
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS isDeleted BOOLEAN DEFAULT false NOT NULL; 