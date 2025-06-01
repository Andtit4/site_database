-- Script pour reset complètement la base de données
-- Cela va supprimer toutes les tables et données existantes

-- Supprimer la base de données si elle existe
DROP DATABASE IF EXISTS u527740812_site_info_db;

-- Recréer la base de données
CREATE DATABASE u527740812_site_info_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sélectionner la base de données
USE u527740812_site_info_db;

-- Message de confirmation
SELECT 'Base de données reset avec succès!' as message; 
