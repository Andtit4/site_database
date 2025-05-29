-- Afficher les migrations actuelles
SELECT * FROM migrations ORDER BY id DESC LIMIT 10;

-- Supprimer la migration problématique (AddTypeColumnToSite1746200000000)
DELETE FROM migrations WHERE name = 'AddTypeColumnToSite1746200000000';

-- Verifier que la migration a bien été supprimée
SELECT * FROM migrations ORDER BY id DESC LIMIT 10; 
