const { DataSource } = require('typeorm');
require('dotenv').config();

async function createTables() {
    const AppDataSource = new DataSource({
        type: 'mysql',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306', 10),
        username: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'u527740812_site_info_db',
        entities: ['../src/**/*.entity{.ts,.js}'],
        synchronize: true, // Activer pour créer les tables
        logging: true, // Voir les requêtes SQL
    });

    try {
        console.log('🔄 Initialisation de TypeORM...');
        await AppDataSource.initialize();

        console.log('✅ Tables créées avec succès !');
        console.log('📋 TypeORM a synchronisé le schéma de base de données.');

        await AppDataSource.destroy();
        console.log('🎉 Processus terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error.message);
        if (error.query) {
            console.error('SQL:', error.query);
        }
        process.exit(1);
    }
}

createTables();