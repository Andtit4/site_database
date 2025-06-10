-- Script pour reset complètement la base de données PostgreSQL
-- Cela va supprimer toutes les tables et données existantes

-- Se connecter à postgres pour pouvoir supprimer/créer la base
-- (Exécuter cette commande en tant qu'utilisateur postgres)

-- Terminer toutes les connexions actives à la base de données
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'site_database'
  AND pid <> pg_backend_pid();

-- Supprimer la base de données si elle existe
DROP DATABASE IF EXISTS site_database;

-- Recréer la base de données avec l'encodage UTF-8
CREATE DATABASE site_database
  WITH 
  OWNER = postgres
  ENCODING = 'UTF8'
  TABLESPACE = pg_default
  CONNECTION LIMIT = -1;

-- Message de confirmation
SELECT 'Base de données PostgreSQL reset avec succès!' as message; 
