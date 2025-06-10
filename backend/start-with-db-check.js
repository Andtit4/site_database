const { Client } = require('pg');
const { spawn } = require('child_process');
require('dotenv').config();

// Configuration de la base de données PostgreSQL
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'site_database',
    connectionTimeoutMillis: 10000,
};

async function checkDatabaseConnection() {
    console.log('🔍 Vérification de la connexion à la base de données PostgreSQL...');
    console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`📍 Database: ${dbConfig.database}`);

    try {
        const client = new Client(dbConfig);
        await client.connect();
        const result = await client.query('SELECT version()');
        console.log('✅ Connexion à PostgreSQL réussie');
        console.log(`📊 Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
        await client.end();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à PostgreSQL:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Suggestion: Vérifiez que PostgreSQL est démarré');
            console.error('   Windows: Vérifiez les services Windows');
            console.error('   macOS: brew services start postgresql');
            console.error('   Linux: sudo systemctl start postgresql');
        } else if (error.code === '28P01') {
            console.error('💡 Suggestion: Erreur d\'authentification - vérifiez les identifiants');
        } else if (error.code === '3D000') {
            console.error('💡 Suggestion: La base de données n\'existe pas');
        }

        return false;
    }
}

async function checkDatabaseExists() {
    console.log('🔍 Vérification de l\'existence de la base de données...');

    try {
        const tempConfig = {...dbConfig };
        tempConfig.database = 'postgres'; // Se connecter à la base par défaut

        const client = new Client(tempConfig);
        await client.connect();

        const result = await client.query(
            'SELECT datname FROM pg_database WHERE datname = $1', [dbConfig.database]
        );

        await client.end();

        if (result.rows.length > 0) {
            console.log('✅ La base de données existe');
            return true;
        } else {
            console.log('⚠️ La base de données n\'existe pas');
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification de la base de données:', error.message);
        return false;
    }
}

async function createDatabase() {
    console.log('🔨 Tentative de création de la base de données...');

    try {
        const tempConfig = {...dbConfig };
        tempConfig.database = 'postgres'; // Se connecter à la base par défaut

        const client = new Client(tempConfig);
        await client.connect();

        await client.query(`CREATE DATABASE "${dbConfig.database}" 
            WITH OWNER = postgres
            ENCODING = 'UTF8'
            CONNECTION LIMIT = -1`);

        console.log('✅ Base de données PostgreSQL créée avec succès');
        await client.end();
        return true;
    } catch (error) {
        if (error.code === '42P04') {
            console.log('✅ La base de données existe déjà');
            return true;
        }
        console.error('❌ Erreur lors de la création de la base de données:', error.message);
        return false;
    }
}

async function checkTables() {
    console.log('🔍 Vérification des tables existantes...');

    try {
        const client = new Client(dbConfig);
        await client.connect();

        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        await client.end();

        if (result.rows.length > 0) {
            console.log(`✅ ${result.rows.length} tables trouvées`);
            result.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        } else {
            console.log('⚠️ Aucune table trouvée. Elles seront créées par NestJS au démarrage.');
        }

        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la vérification des tables:', error.message);
        return false;
    }
}

async function startApplication() {
    console.log('🚀 Démarrage de l\'application NestJS...');

    const npmProcess = spawn('npm', ['run', 'start:dev'], {
        stdio: 'inherit',
        shell: true
    });

    npmProcess.on('close', (code) => {
        console.log(`Application fermée avec le code ${code}`);
    });

    process.on('SIGINT', () => {
        console.log('\n👋 Arrêt de l\'application...');
        npmProcess.kill('SIGINT');
        process.exit(0);
    });
}

async function main() {
    console.log('🔄 Initialisation du serveur PostgreSQL...\n');

    // Vérifier si la base de données existe
    const dbExists = await checkDatabaseExists();

    if (!dbExists) {
        console.log('📝 Base de données manquante, tentative de création...');
        const created = await createDatabase();
        if (!created) {
            console.error('❌ Impossible de créer la base de données. Arrêt du processus.');
            console.error('💡 Essayez de créer manuellement: psql -U postgres -c "CREATE DATABASE site_database;"');
            process.exit(1);
        }
    }

    // Vérifier la connexion
    const isConnected = await checkDatabaseConnection();

    if (isConnected) {
        // Vérifier les tables existantes
        await checkTables();

        console.log('\n✨ Tout est prêt ! Démarrage de l\'application...\n');
        await startApplication();
    } else {
        console.error('\n❌ Impossible de se connecter à la base de données PostgreSQL.');
        console.error('🔧 Vérifiez votre configuration dans le fichier .env et réessayez.');
        console.error('📖 Consultez backend/POSTGRESQL_SETUP.md pour plus d\'aide.');
        process.exit(1);
    }
}

// Démarrer le processus
main().catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});