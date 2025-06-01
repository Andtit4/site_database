-- Script pour ajouter la colonne type à la table equipment
USE u527740812_site_info_db;

-- Ajouter la colonne type avec une valeur par défaut
ALTER TABLE equipment 
ADD COLUMN type ENUM(
  'ANTENNE',
  'ROUTEUR', 
  'BATTERIE',
  'GÉNÉRATEUR',
  'REFROIDISSEMENT',
  'SHELTER',
  'PYLÔNE',
  'SÉCURITÉ'
) NOT NULL DEFAULT 'ANTENNE';

-- Mettre à jour les enregistrements existants en fonction du nom
UPDATE equipment SET type = 'ANTENNE' WHERE name LIKE '%ANTENNE%';
UPDATE equipment SET type = 'ROUTEUR' WHERE name LIKE '%ROUTEUR%';
UPDATE equipment SET type = 'BATTERIE' WHERE name LIKE '%BATTERIE%';
UPDATE equipment SET type = 'GÉNÉRATEUR' WHERE name LIKE '%GÉNÉRATEUR%';
UPDATE equipment SET type = 'REFROIDISSEMENT' WHERE name LIKE '%REFROIDISSEMENT%';
UPDATE equipment SET type = 'SHELTER' WHERE name LIKE '%SHELTER%';
UPDATE equipment SET type = 'PYLÔNE' WHERE name LIKE '%PYLÔNE%';
UPDATE equipment SET type = 'SÉCURITÉ' WHERE name LIKE '%SÉCURITÉ%';

-- Rendre la colonne name nullable
ALTER TABLE equipment MODIFY COLUMN name VARCHAR(255) NULL; 
