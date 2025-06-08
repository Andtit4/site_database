const mysql = require('mysql2/promise');
require('dotenv').config();

async function ultimateReset() {
    const config = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
    };

    const dbName = process.env.DATABASE_NAME || 'u527740812_site_info_db';

    let connection;

    try {
        console.log('🔄 Connexion à MySQL...');
        connection = await mysql.createConnection(config);

        // 1. Connecter à la base spécifique pour supprimer toutes les tables manuellement
        try {
            await connection.query(`USE ${dbName}`);

            console.log('🔍 Recherche de toutes les tables...');
            const [tables] = await connection.query('SHOW TABLES');

            if (tables.length > 0) {
                // Désactiver les contraintes de clés étrangères
                console.log('🔓 Désactivation des contraintes de clés étrangères...');
                await connection.query('SET FOREIGN_KEY_CHECKS = 0');

                // Supprimer toutes les tables une par une
                console.log(`🗑️ Suppression de ${tables.length} table(s)...`);
                for (const table of tables) {
                    const tableName = Object.values(table)[0];
                    console.log(`   Suppression: ${tableName}`);
                    await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
                }

                // Réactiver les contraintes
                console.log('🔒 Réactivation des contraintes de clés étrangères...');
                await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            }
        } catch (error) {
            console.log('⚠️ Base de données inaccessible (peut-être déjà supprimée)');
        }

        // 2. Supprimer complètement la base de données
        console.log('💥 Suppression totale de la base de données...');
        await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);

        console.log('⏳ Attente de 3 secondes...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 3. Recréer une base complètement neuve
        console.log('🏗️ Création d\'une nouvelle base de données...');
        await connection.query(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        // 4. Vérification finale
        await connection.query(`USE ${dbName}`);
        const [finalTables] = await connection.query('SHOW TABLES');

        if (finalTables.length === 0) {
            console.log('✅ SUCCÈS ! La base de données est maintenant complètement vide.');
        } else {
            console.log('❌ ÉCHEC ! Il reste encore des tables...');
            finalTables.forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        }

    } catch (error) {
        console.error('❌ Erreur lors du reset ultime:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

ultimateReset();