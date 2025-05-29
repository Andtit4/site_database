// Script pour empêcher l'exécution des migrations automatiques
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function blockMigrations() {
    try {
        // 1. Créer une connexion à la base de données
        console.log('Tentative de connexion à la base de données...');
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306', 10),
            user: process.env.DATABASE_USERNAME || 'root',
            password: process.env.DATABASE_PASSWORD || '',
            database: process.env.DATABASE_NAME || 'site_info_db',
            connectionLimit: 10
        });
        console.log('Connexion établie avec succès.');

        // 2. Essayer de supprimer la migration problématique si elle existe
        try {
            const [rows] = await connection.execute(
                'SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ?) AS table_exists', [process.env.DATABASE_NAME || 'site_info_db', 'migrations']
            );

            if (rows[0].table_exists) {
                console.log('Tentative de suppression de la migration problématique...');
                await connection.execute(
                    'DELETE FROM migrations WHERE name = ?', ['AddTypeColumnToSite1746200000000']
                );
                console.log('Migration supprimée de la base de données si elle existait.');
            } else {
                console.log('La table migrations n\'existe pas dans la base de données.');
            }
        } catch (dbError) {
            console.log('Erreur lors de la suppression de la migration:', dbError.message);
        }

        // 3. Fermer la connexion à la base de données
        await connection.end();
        console.log('Connexion à la base de données fermée.');

        // 4. Désactiver les références à type dans les DTOs
        console.log('Désactivation des fonctionnalités problématiques...');

        // Modifier le fichier typeorm.config.ts pour désactiver les migrations
        const typeormConfigPath = path.join(__dirname, '../src/config/typeorm.config.ts');
        if (fs.existsSync(typeormConfigPath)) {
            let typeormConfig = fs.readFileSync(typeormConfigPath, 'utf8');

            // Désactiver les migrations
            typeormConfig = typeormConfig.replace(
                /migrations: \[.*?\]/g,
                'migrations: []'
            );

            fs.writeFileSync(typeormConfigPath, typeormConfig);
            console.log('Migrations désactivées dans la configuration TypeORM.');
        }

        console.log('Opération terminée. Les migrations sont maintenant bloquées.');
    } catch (error) {
        console.error('Erreur lors du blocage des migrations:', error.message);
    }
}

blockMigrations();