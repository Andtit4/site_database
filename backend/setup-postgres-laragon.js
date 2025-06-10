const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    console.log('🔍 Configuration PostgreSQL pour Laragon...');

    // Configuration par défaut de Laragon
    const defaultConfig = {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'root',
    };

    console.log('📋 Configuration utilisée:', {
        host: defaultConfig.host,
        port: defaultConfig.port,
        user: defaultConfig.user,
        password: '***'
    });

    try {
        // 1. Connexion à la base par défaut pour créer notre base
        console.log('🔌 Test de connexion à PostgreSQL...');
        const adminClient = new Client({
            ...defaultConfig,
            database: 'postgres' // Base par défaut
        });

        await adminClient.connect();
        console.log('✅ Connexion PostgreSQL réussie !');

        // 2. Vérifier si la base existe
        const dbName = process.env.DATABASE_NAME || 'site_db_info';
        console.log(`🔍 Vérification de la base de données "${dbName}"...`);

        const checkDbQuery = 'SELECT 1 FROM pg_database WHERE datname = $1';
        const result = await adminClient.query(checkDbQuery, [dbName]);

        if (result.rows.length === 0) {
            // 3. Créer la base de données
            console.log(`📊 Création de la base de données "${dbName}"...`);
            await adminClient.query(`CREATE DATABASE "${dbName}"`);
            console.log('✅ Base de données créée avec succès !');
        } else {
            console.log('✅ Base de données déjà existante.');
        }

        await adminClient.end();

        // 4. Test de connexion à notre base
        console.log('🔌 Test de connexion à notre base de données...');
        const appClient = new Client({
            ...defaultConfig,
            database: dbName
        });

        await appClient.connect();
        console.log('✅ Connexion à la base applicative réussie !');

        // Afficher les informations de version
        const versionResult = await appClient.query('SELECT version()');
        console.log('🐘 Version PostgreSQL:', versionResult.rows[0].version.split(' ')[0]);

        await appClient.end();

        console.log('\n🎉 Configuration PostgreSQL terminée avec succès !');
        console.log('🚀 Vous pouvez maintenant démarrer le backend avec: npm run start:dev');

    } catch (error) {
        console.error('❌ Erreur:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solutions possibles:');
            console.log('   1. Vérifiez que PostgreSQL est démarré dans Laragon');
            console.log('   2. Vérifiez le port PostgreSQL dans Laragon (défaut: 5432)');
            console.log('   3. Vérifiez les identifiants dans le fichier .env');
        } else if (error.code === '28P01') {
            console.log('\n💡 Erreur d\'authentification:');
            console.log('   - Vérifiez le mot de passe PostgreSQL dans Laragon');
            console.log('   - Mettez à jour le fichier .env avec les bons identifiants');
        }

        process.exit(1);
    }
}

setupDatabase();