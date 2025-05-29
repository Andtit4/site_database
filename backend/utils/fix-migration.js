// Script pour corriger le problème de migration
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fixMigrationIssue() {
    console.log('Tentative de connexion à la base de données...');

    try {
        // Créer la connexion à la DB
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306', 10),
            user: process.env.DATABASE_USERNAME || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            database: process.env.DATABASE_NAME || 'site_info_db',
            connectionLimit: 10
        });

        console.log('Connexion établie avec succès.');

        // Supprimer la migration problématique
        console.log('Suppression de la migration problématique...');
        const [result] = await connection.execute(
            'DELETE FROM migrations WHERE name = ?', ['AddTypeColumnToSite1746200000000']
        );

        console.log(`Migration supprimée: ${result.affectedRows} ligne(s) affectée(s).`);

        // Fermer la connexion
        await connection.end();
        console.log('Connexion fermée.');
        console.log('Terminé.');
    } catch (error) {
        console.error('Erreur lors de la correction de la migration:', error.message);
    }
}

fixMigrationIssue();