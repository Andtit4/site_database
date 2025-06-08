const mysql = require('mysql2/promise');
require('dotenv').config();

async function forceResetDatabase() {
    const config = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
    };

    const dbName = process.env.DATABASE_NAME || 'u527740812_site_info_db';

    let connection;

    try {
        console.log('🔄 Connexion à MySQL (sans base spécifique)...');
        connection = await mysql.createConnection(config);

        console.log('🗑️ Suppression complète de la base de données...');
        await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);

        console.log('⏳ Attente de 2 secondes...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('🏗️ Création d\'une nouvelle base de données...');
        await connection.query(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        console.log('✅ Reset forcé terminé avec succès !');
        console.log('📋 La base de données est maintenant complètement vide.');

    } catch (error) {
        console.error('❌ Erreur lors du reset forcé:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

forceResetDatabase();