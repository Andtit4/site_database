const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    console.log('Initialisation de la base de données...');

    try {
        // Paramètres de connexion
        const connectionConfig = {
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306', 10),
            user: process.env.DATABASE_USERNAME || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            multipleStatements: true
        };

        // Se connecter sans spécifier la base de données
        const connection = await mysql.createConnection(connectionConfig);

        console.log('Connexion à MySQL établie');

        const dbName = process.env.DATABASE_NAME || 'site_info_db';

        // Vérifier si la base de données existe
        const [rows] = await connection.query(`
            SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?
        `, [dbName]);

        if (rows.length > 0) {
            console.log(`La base de données ${dbName} existe déjà. Suppression...`);
            await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
        }

        // Créer la base de données
        console.log(`Création de la base de données ${dbName}...`);
        await connection.query(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Base de données ${dbName} créée avec succès`);

        // Fermer la connexion
        await connection.end();
        console.log('Connexion à MySQL fermée');

        console.log('Initialisation terminée. Vous pouvez maintenant démarrer le serveur.');
        console.log('Utilisez `npm run start:dev` pour démarrer le serveur en mode développement.');

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        process.exit(1);
    }
}

main();