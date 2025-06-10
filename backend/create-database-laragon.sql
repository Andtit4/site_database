-- Script pour créer la base de données avec Laragon PostgreSQL
-- À exécuter dans pgAdmin ou l'interface PostgreSQL de Laragon

-- Créer la base de données si elle n'existe pas
CREATE DATABASE site_db_info;

-- Se connecter à la base de données
\c site_db_info;

-- Créer un utilisateur avec tous les privilèges (optionnel)
-- CREATE USER site_user WITH PASSWORD 'site_password';
-- GRANT ALL PRIVILEGES ON DATABASE site_db_info TO site_user;

-- Afficher les bases de données pour vérifier
\l; 
