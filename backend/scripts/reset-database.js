const { DataSource } = require('typeorm');
require('dotenv').config();

// Configuration pour se connecter à MySQL sans base de données spécifique
const adminDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 3306,
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    // Pas de database pour pouvoir la créer/supprimer
});

// Configuration pour la base de données spécifique
const appDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 3306,
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'u527740812_site_info_db',
    entities: ['../src/**/*.entity.ts'],
    synchronize: true, // ATTENTION: Cela va recréer les tables
    dropSchema: true, // ATTENTION: Cela va supprimer toutes les tables
});

async function resetDatabase() {
    try {
        console.log('🔄 Connexion à MySQL...');
        await adminDataSource.initialize();

        const dbName = process.env.DATABASE_NAME || 'u527740812_site_info_db';

        console.log('🗑️ Suppression de la base de données...');
        await adminDataSource.query(`DROP DATABASE IF EXISTS ${dbName}`);

        console.log('🏗️ Création de la base de données...');
        await adminDataSource.query(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        await adminDataSource.destroy();

        console.log('🔄 Connexion à la nouvelle base de données...');
        await appDataSource.initialize();

        console.log('✅ Base de données reset avec succès !');
        console.log('📊 TypeORM va maintenant créer les tables...');

        await appDataSource.destroy();
        console.log('🎉 Terminé ! La base de données est prête.');

    } catch (error) {
        console.error('❌ Erreur lors du reset de la base de données:', error.message);
        process.exit(1);
    }
}

resetDatabase();